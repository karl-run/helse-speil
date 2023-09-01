import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { BodyShort, Fieldset, TextField } from '@navikt/ds-react';

import { Arbeidsgiver } from '@io/graphql';
import { somPenger } from '@utils/locale';

import { Arbeidsgivernavn } from '../../../Arbeidsgivernavn';
import { ArbeidsgiverForm } from '../../skjønnsfastsetting';
import styles from '../SkjønnsfastsettingForm/SkjønnsfastsettingForm.module.css';

interface SkjønnsfastsettingArbeidsgivereProps {
    arbeidsgivere: Arbeidsgiver[];
    sammenligningsgrunnlag: number;
}

export const SkjønnsfastsettingArbeidsgivere = ({
    arbeidsgivere,
    sammenligningsgrunnlag,
}: SkjønnsfastsettingArbeidsgivereProps) => {
    const [tilFordeling, setTilFordeling] = useState(sammenligningsgrunnlag);

    const { control, register, formState, clearErrors } = useFormContext<{
        arbeidsgivere: ArbeidsgiverForm[];
    }>();

    const { watch } = useFormContext();
    const begrunnelseId = watch('begrunnelseId', '0');

    const { fields } = useFieldArray({
        control,
        name: 'arbeidsgivere',
        rules: {
            validate: {
                måVæreNumerisk: (values) =>
                    values.some((value) => isNumeric(value.årlig.toString())) || 'Årsinntekt må være et beløp',
                sammenligningsgrunnlagMåVæreFordelt: (values) =>
                    (begrunnelseId === '1' &&
                        sammenligningsgrunnlag - values.reduce((sum, { årlig }) => sum + årlig, 0) === 0) ||
                    'Må fordele hele sammenligningsgrunnlaget',
            },
        },
    });

    const isNumeric = (input: string) => /^\d+(\.\d{1,2})?$/.test(input);

    const getArbeidsgiverNavn = (organisasjonsnummer: string) =>
        arbeidsgivere.find((ag) => ag.organisasjonsnummer === organisasjonsnummer)?.navn;

    const arbeidsgivereField = useWatch({ name: 'arbeidsgivere', control });

    useEffect(() => {
        if (begrunnelseId === '1') {
            const inntektsum = arbeidsgivereField.reduce((sum, { årlig }) => sum + årlig, 0);
            setTilFordeling(sammenligningsgrunnlag - (isNaN(inntektsum) ? 0 : inntektsum));
        }
    }, [begrunnelseId, arbeidsgivereField]);

    return (
        <>
            {begrunnelseId === '1' && <div>Til fordeling: {somPenger(tilFordeling)}</div>}
            <div className={styles.arbeidsgivereHeader}>
                <BodyShort className={styles.arbeidsgiverInput}>Sammenligningsgrunnlag</BodyShort>
                <BodyShort className={styles.arbeidsgiverInput}>Til fordeling</BodyShort>
            </div>
            <Fieldset
                className={styles.arbeidsgivere}
                id="arbeidsgivere"
                legend="Skjønnsfastsett arbeidsgiver(e)"
                hideLegend
            >
                {fields.map((field, index) => {
                    const årligField = register(`arbeidsgivere.${index}.årlig`, {
                        valueAsNumber: true,
                    });

                    return (
                        <div key={field.id}>
                            <label className={classNames([styles.arbeidsgiver, styles.label])}>
                                <Arbeidsgivernavn
                                    arbeidsgivernavn={getArbeidsgiverNavn(field.organisasjonsnummer)}
                                    className={styles.arbeidsgivernavn}
                                />
                                {begrunnelseId === '1' && (
                                    <TextField
                                        label="Rapportert årsinntekt"
                                        hideLabel
                                        className={styles.arbeidsgiverInput}
                                        size="small"
                                        disabled
                                        value={field.årlig}
                                    />
                                )}
                                <TextField
                                    {...årligField}
                                    onChange={(e) => {
                                        clearErrors('arbeidsgivere');
                                        return årligField.onChange(e);
                                    }}
                                    error={formState.errors.arbeidsgivere?.root?.message}
                                    className={styles.arbeidsgiverInput}
                                    size="small"
                                    label="Skjønnsfastsatt årlig inntekt"
                                    hideLabel
                                    type="text"
                                    inputMode="numeric"
                                    disabled={begrunnelseId === '0'}
                                />
                                <input
                                    {...register(`arbeidsgivere.${index}.organisasjonsnummer`, {
                                        value: field.organisasjonsnummer,
                                    })}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    );
                })}
            </Fieldset>
        </>
    );
};
