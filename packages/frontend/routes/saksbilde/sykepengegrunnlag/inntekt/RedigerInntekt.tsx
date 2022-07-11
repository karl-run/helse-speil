import React, { Dispatch, SetStateAction } from 'react';
import {
    useActiveGenerationIsLast,
    useActivePeriodHasLatestSkjæringstidspunkt,
    useHarKunEnFagsystemIdPåArbeidsgiverIAktivPeriode,
} from '@hooks/revurdering';
import { EditButton } from '@components/EditButton';
import { PopoverHjelpetekst } from '@components/PopoverHjelpetekst';
import { SortInfoikon } from '@components/ikoner/SortInfoikon';
import { Inntektstype, Vilkarsgrunnlagtype } from '@io/graphql';
import { useVilkårsgrunnlag } from '@state/person';
import { defaultOverstyrToggles, erDev, erLocal } from '@utils/featureToggles';

interface RedigerInntektProps {
    setEditing: Dispatch<SetStateAction<boolean>>;
    editing: boolean;
    erRevurdering: boolean;
    inntektstype: Inntektstype;
    skjæringstidspunkt: DateString;
    vilkårsgrunnlagId: string;
}

export const RedigerInntekt = ({
    setEditing,
    editing,
    erRevurdering,
    inntektstype,
    skjæringstidspunkt,
    vilkårsgrunnlagId,
}: RedigerInntektProps) => {
    const harKunEnArbeidsgiver = inntektstype === Inntektstype.Enarbeidsgiver;
    const erAktivPeriodeISisteSkjæringstidspunkt = useActivePeriodHasLatestSkjæringstidspunkt();
    const erTidslinjeperiodeISisteGenerasjon = useActiveGenerationIsLast();

    const erSpleisVilkårsgrunnlagtype =
        useVilkårsgrunnlag(vilkårsgrunnlagId, skjæringstidspunkt)?.vilkarsgrunnlagtype === Vilkarsgrunnlagtype.Spleis;
    const erIkkePingPong = useHarKunEnFagsystemIdPåArbeidsgiverIAktivPeriode();

    if (!erTidslinjeperiodeISisteGenerasjon) return null;

    const revurdereTidligereUtbetalinger = erDev() || erLocal() || erAktivPeriodeISisteSkjæringstidspunkt;
    const erIkkeRevurderingAvFlereArbeidsgivere = inntektstype !== 'FLEREARBEIDSGIVERE' || !erRevurdering;

    return (harKunEnArbeidsgiver || defaultOverstyrToggles.overstyrInntektFlereArbeidsgivereEnabled) &&
        revurdereTidligereUtbetalinger &&
        erSpleisVilkårsgrunnlagtype &&
        erIkkePingPong &&
        erIkkeRevurderingAvFlereArbeidsgivere ? (
        <EditButton
            isOpen={editing}
            openText="Avbryt"
            closedText={erRevurdering ? 'Revurder' : 'Endre'}
            onOpen={() => setEditing(true)}
            onClose={() => setEditing(false)}
            style={{ justifySelf: 'flex-end' }}
        />
    ) : erTidslinjeperiodeISisteGenerasjon ? (
        <PopoverHjelpetekst ikon={<SortInfoikon />}>
            <p>
                {!revurdereTidligereUtbetalinger
                    ? 'Kan ikke endre inntekt, det er foreløpig ikke støtte for endringer i saker i tidligere skjæringstidspunkt'
                    : !harKunEnArbeidsgiver
                    ? 'Kan ikke endre inntekt, det er foreløpig ikke støtte for saker med flere arbeidsgivere'
                    : 'Det er foreløpig ikke støtte for endringer i saker som har vært delvis behandlet i Infotrygd'}
            </p>
        </PopoverHjelpetekst>
    ) : (
        <></>
    );
};
