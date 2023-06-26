import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import styles from './SkjønnsfastsettingForm.module.css';

export const SkjønnsfastsettingÅrsak = () => {
    const { formState, register } = useFormContext();
    const { ref, ...årsakValidation } = register('årsak', { required: 'Du må velge en årsak' });

    return (
        <RadioGroup
            className={styles.årsak}
            name="årsak"
            error={formState.errors.årsak ? (formState.errors.årsak.message as string) : null}
            legend="Årsak til skjønnsfastsettelse"
            defaultValue={årsaker[0]}
        >
            {årsaker.map((årsak, index) => (
                <Radio ref={ref} value={årsak} key={index} {...årsakValidation}>
                    {årsak}
                </Radio>
            ))}
        </RadioGroup>
    );
};

const årsaker = ['Skjønnsfastsetting ved mer enn 25% avvik'];
