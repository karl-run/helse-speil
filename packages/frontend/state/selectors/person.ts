import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

import { Arbeidsgiverinntekt, Vilkarsgrunnlag } from '@io/graphql';
import { getRequiredTimestamp, isGodkjent } from '@state/selectors/utbetaling';
import { isBeregnetPeriode, isDagoverstyring } from '@utils/typeguards';

dayjs.extend(minMax);

export const getRequiredInntekt = (
    vilkårsgrunnlag: Vilkarsgrunnlag,
    organisasjonsnummer: string,
): Arbeidsgiverinntekt =>
    vilkårsgrunnlag.inntekter.find((it) => it.arbeidsgiver === organisasjonsnummer) ??
    (() => {
        throw Error('Fant ikke inntekt');
    })();

export type Inntekter = {
    organisasjonsnummer: string;
    fraInntektsmelding?: Maybe<Arbeidsgiverinntekt>;
    fraAOrdningen?: Maybe<Arbeidsgiverinntekt>;
};

export const getVilkårsgrunnlag = (person: FetchedPerson, grunnlagId?: Maybe<string>): Vilkarsgrunnlag | null => {
    return person.vilkarsgrunnlag.find(({ id }) => id === grunnlagId) ?? null;
};

export const getRequiredVilkårsgrunnlag = (person: FetchedPerson, grunnlagId?: Maybe<string>): Vilkarsgrunnlag => {
    return (
        getVilkårsgrunnlag(person, grunnlagId) ??
        (() => {
            throw Error('Fant ikke vilkårsgrunnlag');
        })()
    );
};

export const getLatestUtbetalingTimestamp = (person: FetchedPerson, after: DateString = '1970-01-01'): Dayjs => {
    let latest: Dayjs = dayjs(after);

    for (const arbeidsgiver of person.arbeidsgivere) {
        for (const periode of arbeidsgiver.generasjoner[0]?.perioder ?? []) {
            if (isBeregnetPeriode(periode) && isGodkjent(periode.utbetaling)) {
                latest = dayjs.max(dayjs(getRequiredTimestamp(periode.utbetaling)), latest) as Dayjs;
            }
        }
    }

    return latest;
};

export const getOverstyringerForEksisterendePerioder = (person: FetchedPerson, after: Dayjs) => {
    const perioder = person.arbeidsgivere.flatMap((it) => it.generasjoner.flatMap((generasjon) => generasjon.perioder));

    return person.arbeidsgivere
        .flatMap(({ overstyringer }) => overstyringer)
        .filter((overstyring) => dayjs(overstyring.timestamp).isAfter(after))
        .filter((overstyring) => {
            if (isDagoverstyring(overstyring)) {
                // Ser om dagoverstyringen gjelder for en periode som fortsatt finnes (at den ikke er kastet ut til infotrygd med overstyringen hengende igjen f.eks.)
                return (
                    perioder.filter(
                        (periode) =>
                            dayjs(overstyring.dager[0].dato).isSameOrAfter(periode.fom) &&
                            dayjs(overstyring.dager[0].dato).isSameOrBefore(periode.tom),
                    ).length !== 0
                );
            }
            return true;
        });
};
