import classNames from 'classnames';
import React, { MouseEvent } from 'react';

import { ErrorColored } from '@navikt/ds-icons';

import { Varselstatus } from '@io/graphql';
import { useInnloggetSaksbehandler } from '@state/authentication';

import { CheckIcon } from '../timeline/icons';

import styles from './Avhuking.module.css';

type AvhukingProps = {
    type: 'feil' | 'aktiv' | 'vurdert' | 'ferdig-behandlet';
    varselstatus: Varselstatus;
    settVurdert: (ident: string) => void;
    settAktiv: (ident: string) => void;
};

export const Avhuking: React.FC<AvhukingProps> = ({ type, varselstatus, settVurdert, settAktiv }) => {
    const innloggetSaksbehandler = useInnloggetSaksbehandler();

    const disabledButton = varselstatus === Varselstatus.Godkjent || type === 'feil';

    const clickEvent = (event: MouseEvent<HTMLSpanElement>) => {
        if (disabledButton) return;
        event.stopPropagation();
        event.preventDefault();
        endreVarselStatus();
    };

    const keyboardEvent = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (disabledButton) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.stopPropagation();
            event.preventDefault();
            endreVarselStatus();
        }
    };

    const endreVarselStatus = () => {
        const ident = innloggetSaksbehandler.ident;

        if (varselstatus === Varselstatus.Aktiv) {
            settVurdert(ident ?? '');
        } else if (varselstatus === Varselstatus.Vurdert) {
            settAktiv(ident ?? '');
        }
    };

    return (
        <span
            role="button"
            tabIndex={disabledButton ? -1 : 0}
            aria-disabled={disabledButton}
            aria-label="Toggle varselvurdering"
            onClick={clickEvent}
            onKeyDown={keyboardEvent}
            className={classNames(styles.avhuking, styles[type])}
        >
            {type === 'feil' ? <ErrorColored width="24px" height="24px" /> : <CheckIcon width="24px" height="24px" />}
        </span>
    );
};
