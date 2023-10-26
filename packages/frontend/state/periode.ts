import { useEffect } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import { Periodetilstand } from '@io/graphql';
import { useCurrentPerson } from '@state/person';
import { isBeregnetPeriode, isUberegnetVilkarsprovdPeriode } from '@utils/typeguards';

const activePeriodIdState = atom<string | { fom: string; orgnummer: string } | null>({
    key: 'activePeriodId',
    default: null,
});

export const useSetActivePeriodId = () => {
    const person = useCurrentPerson();
    const [activePeriodId, setActivePeriodId] = useRecoilState(activePeriodIdState);

    return (periodeId: string) => {
        const periode = findPeriod(periodeId, person)?.periodetilstand;
        if (activePeriodId === periode || !periode) return;
        setActivePeriodId(periode.vedtaksperiodeId);
    };
};

export const useActivePeriod = (): ActivePeriod | null => {
    const person = useCurrentPerson();
    const activePeriodId = useRecoilValue(activePeriodIdState);
    useSelectInitialPeriod();
    useUnsetActivePeriodOnNewPerson();
    return activePeriodId ? findPeriod(activePeriodId, person) : null;
};

const useSelectInitialPeriod = () => {
    const person = useCurrentPerson();
    const [activePeriodId, setActivePeriodId] = useRecoilState(activePeriodIdState);

    useEffect(() => {
        if (!person || activePeriodId) return;
        const perioderINyesteGenerasjoner = person.arbeidsgivere.flatMap(
            (arbeidsgiver) => arbeidsgiver.generasjoner[0]?.perioder ?? [],
        );
        const aktuellePerioder = perioderINyesteGenerasjoner
            .sort((a, b) => new Date(b.fom).getTime() - new Date(a.fom).getTime())
            .filter(
                (period) =>
                    (isBeregnetPeriode(period) || isUberegnetVilkarsprovdPeriode(period)) &&
                    period.periodetilstand !== Periodetilstand.TilInfotrygd,
            );

        const periodeTilBehandling = aktuellePerioder.find(
            (periode) =>
                (isBeregnetPeriode(periode) &&
                    periode.periodetilstand === Periodetilstand.TilGodkjenning &&
                    typeof periode.oppgave?.id === 'string') ||
                (isUberegnetVilkarsprovdPeriode(periode) &&
                    periode.periodetilstand === Periodetilstand.TilSkjonnsfastsettelse),
        );
        setActivePeriodId((periodeTilBehandling ?? aktuellePerioder[0] ?? null)?.id);
    }, [person, activePeriodId]);
};

const useUnsetActivePeriodOnNewPerson = () => {
    const person = useCurrentPerson();
    const [activePeriodId, setActivePeriodId] = useRecoilState(activePeriodIdState);
    useEffect(() => {
        if (person && activePeriodId && !findPeriod(activePeriodId, person)) {
            setActivePeriodId(null);
        }
    }, [person, activePeriodId]);
};

const findPeriod = (periodeId: string, person: FetchPersonQuery['person']) =>
    person?.arbeidsgivere
        .flatMap((arbeidsgiver) => arbeidsgiver.generasjoner)
        .flatMap((generasjon) => generasjon.perioder)
        .find((periode) => periode.vedtaksperiodeId === periodeId) ?? null;
