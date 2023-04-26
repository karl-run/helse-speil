import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';

import { BodyShort, Loader } from '@navikt/ds-react';

import { useMutation } from '@apollo/client';
import { VarselDto, Varselstatus } from '@io/graphql';
import { SettVarselstatusAktivDocument, SettVarselstatusVurdertDocument } from '@io/graphql/generated/graphql2';
import { ISO_TIDSPUNKTFORMAT, getFormattedDatetimeString } from '@utils/date';

import { Avhuking } from './Avhuking';

import styles from './Varsel.module.css';

interface VarselProps extends HTMLAttributes<HTMLDivElement> {
    varsel: VarselDto;
    type: 'feil' | 'aktiv' | 'vurdert' | 'ferdig-behandlet';
}

export const Varsel: React.FC<VarselProps> = ({ className, varsel, type }) => {
    const [vurdertMutation, vurdertMutationResult] = useMutation(SettVarselstatusVurdertDocument);
    const [aktivMutation, aktivMutationResult] = useMutation(SettVarselstatusAktivDocument);
    const settVurdert = (ident: string) => {
        vurdertMutation({
            variables: {
                generasjonIdString: varsel.generasjonId,
                definisjonIdString: varsel.definisjonId,
                varselkode: varsel.kode,
                ident: ident,
            },
            optimisticResponse: {
                __typename: 'Mutation',
                settVarselstatusVurdert: {
                    __typename: 'VarselDTO',
                    definisjonId: '',
                    generasjonId: 'EN_ID',
                    kode: 'EN_KODE',
                    tittel: 'Hei fra mocken',
                    forklaring: null,
                    handling: null,
                    vurdering: {
                        status: Varselstatus.Vurdert,
                        ident: ident,
                        tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                    },
                },
            },
        });
    };
    const settAktiv = (ident: string) => {
        aktivMutation({
            variables: {
                generasjonIdString: varsel.generasjonId,
                varselkode: varsel.kode,
                ident: ident,
            },
            optimisticResponse: {
                __typename: 'Mutation',
                settVarselstatusAktiv: {
                    __typename: 'VarselDTO',
                    definisjonId: '',
                    generasjonId: 'EN_ID',
                    kode: 'EN_KODE',
                    tittel: 'Hei fra mocken',
                    forklaring: null,
                    handling: null,
                    vurdering: {
                        status: Varselstatus.Aktiv,
                        ident: ident,
                        tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                    },
                },
            },
        });
    };

    const varselVurdering = varsel.vurdering;
    const varselStatus = varselVurdering?.status ?? Varselstatus.Aktiv;
    return (
        <div className={classNames(className, styles.varsel, styles[type])}>
            {vurdertMutationResult.loading || aktivMutationResult.loading ? (
                <Loader
                    style={{ height: 'var(--navds-font-line-height-xlarge)', alignSelf: 'flex-start' }}
                    size="medium"
                    variant="interaction"
                />
            ) : (
                <Avhuking type={type} varselstatus={varselStatus} settVurdert={settVurdert} settAktiv={settAktiv} />
            )}
            <div className={styles.wrapper}>
                <BodyShort as="p">{varsel.tittel}</BodyShort>
                {(varselStatus === Varselstatus.Vurdert || varselStatus === Varselstatus.Godkjent) && (
                    <BodyShort className={styles.vurdering} as="p">
                        {getFormattedDatetimeString(varselVurdering?.tidsstempel)} av {varselVurdering?.ident}
                    </BodyShort>
                )}
                {(vurdertMutationResult.error || aktivMutationResult.error) && (
                    <BodyShort className={styles.error} as="p">
                        🫦
                    </BodyShort>
                )}
            </div>
        </div>
    );
};
