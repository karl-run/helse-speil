import { SkjønnsfastsettingArbeidsgivere } from './SkjønnsfastsettingArbeidsgivere';
import { SkjønnsfastsettingBegrunnelse } from './SkjønnsfastsettingBegrunnelse';
import { SkjønnsfastsettingÅrsak } from './SkjønnsfastsettingÅrsak';
import {
    ArbeidsgiverForm,
    skjønnsfastsettelseBegrunnelser,
    usePostSkjønnsfastsattSykepengegrunnlag,
} from './skjønnsfastsetting';
import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button, Loader } from '@navikt/ds-react';

import { ErrorMessage } from '@components/ErrorMessage';
import { TimeoutModal } from '@components/TimeoutModal';
import { Arbeidsgiverinntekt } from '@io/graphql';
import { SkjønnsfastsattSykepengegrunnlagDTO } from '@io/http';
import { useActivePeriod } from '@state/periode';
import { useCurrentPerson } from '@state/person';

import { Feiloppsummering } from '../inntekt/EditableInntekt/Feiloppsummering';

import styles from './SkjønnsfastsettingForm.module.css';

interface SkjønnsfastsettingFormProps {
    inntekter: Arbeidsgiverinntekt[];
    omregnetÅrsinntekt: number;
    sammenligningsgrunnlag: number;
    onEndretSykepengegrunnlag: (endretSykepengegrunnlag: Maybe<number>) => void;
    setEditing: (state: boolean) => void;
}

export const SkjønnsfastsettingForm = ({
    inntekter,
    omregnetÅrsinntekt,
    sammenligningsgrunnlag,
    onEndretSykepengegrunnlag,
    setEditing,
}: SkjønnsfastsettingFormProps) => {
    const form = useForm({ shouldFocusError: false, mode: 'onBlur' });
    const feiloppsummeringRef = useRef<HTMLDivElement>(null);
    const period = useActivePeriod();
    const person = useCurrentPerson();
    const { isLoading, error, postSkjønnsfastsetting, timedOut, setTimedOut } =
        usePostSkjønnsfastsattSykepengegrunnlag();

    const harFeil = !form.formState.isValid && form.formState.isSubmitted;
    const visFeilOppsummering = harFeil && Object.entries(form.formState.errors).length > 0;

    const sykepengegrunnlagEndring = form
        .watch('arbeidsgivere')
        ?.reduce((a: number, b: ArbeidsgiverForm) => +a + +b.årlig, 0.0);

    useEffect(() => {
        harFeil && feiloppsummeringRef.current?.focus();
    }, [harFeil]);

    useEffect(() => {
        onEndretSykepengegrunnlag(sykepengegrunnlagEndring);
    }, [sykepengegrunnlagEndring]);

    if (!period || !person) return null;

    const confirmChanges = () => {
        const { arbeidsgivere, årsak, begrunnelseId, begrunnelseFritekst } = form.getValues();
        const begrunnelse = skjønnsfastsettelseBegrunnelser(omregnetÅrsinntekt, sammenligningsgrunnlag).find(
            (it) => it.id === begrunnelseId,
        );

        const skjønnsfastsettingSykepengegrunnlag: SkjønnsfastsattSykepengegrunnlagDTO = {
            fødselsnummer: person.fodselsnummer,
            aktørId: person.aktorId,
            skjæringstidspunkt: period.skjaeringstidspunkt,
            arbeidsgivere: arbeidsgivere.map(({ årlig, organisasjonsnummer }: ArbeidsgiverForm) => {
                return {
                    organisasjonsnummer: organisasjonsnummer,
                    årlig: årlig,
                    fraÅrlig: inntekter.find((it) => it.arbeidsgiver === organisasjonsnummer)?.omregnetArsinntekt
                        ?.belop,
                    årsak: årsak,
                    begrunnelse: `${begrunnelse?.mal}\n\n${begrunnelseFritekst}`,
                    ...(begrunnelse?.subsumsjon?.paragraf && {
                        subsumsjon: {
                            paragraf: begrunnelse.subsumsjon.paragraf,
                            ledd: begrunnelse.subsumsjon?.ledd,
                            bokstav: begrunnelse.subsumsjon?.bokstav,
                        },
                    }),
                };
            }),
        };
        // TODO: Fjern etter testing i dev:
        console.log(skjønnsfastsettingSykepengegrunnlag);
        postSkjønnsfastsetting(skjønnsfastsettingSykepengegrunnlag);
        cancelEditing();
    };

    const cancelEditing = () => {
        setEditing(false);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(confirmChanges)}>
                <div className={styles.skjønnsfastsetting}>
                    <SkjønnsfastsettingArbeidsgivere inntekter={inntekter} arbeidsgivere={person.arbeidsgivere} />
                    <SkjønnsfastsettingÅrsak />
                    <SkjønnsfastsettingBegrunnelse
                        omregnetÅrsinntekt={omregnetÅrsinntekt}
                        sammenligningsgrunnlag={sammenligningsgrunnlag}
                    />
                    {visFeilOppsummering && (
                        <Feiloppsummering feiloppsummeringRef={feiloppsummeringRef} errors={form.formState.errors} />
                    )}
                    <span className={styles.buttons}>
                        <Button className={styles.button} variant="secondary" size="small">
                            Lagre
                            {isLoading && <Loader size="xsmall" />}
                        </Button>
                        <Button className={styles.button} variant="tertiary" onClick={cancelEditing} size="small">
                            Avbryt
                        </Button>
                    </span>
                    {error && <ErrorMessage className={styles.error}>{error}</ErrorMessage>}
                    {timedOut && <TimeoutModal onRequestClose={() => setTimedOut(false)} />}
                </div>
            </form>
        </FormProvider>
    );
};
