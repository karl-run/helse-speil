import React from 'react';

import { CaseworkerFilled } from '@navikt/ds-icons';
import { BodyShort } from '@navikt/ds-react';

import { Bold } from '@components/Bold';
import { EditButton } from '@components/EditButton';
import { Endringstrekant } from '@components/Endringstrekant';
import { Kilde } from '@components/Kilde';
import { useIsReadOnlyOppgave } from '@hooks/useIsReadOnlyOppgave';
import { Kildetype, Sykepengegrunnlagsgrense } from '@io/graphql';
import { useCurrentPerson } from '@state/person';
import { kanSkjønnsfastsetteSykepengegrunnlag } from '@utils/featureToggles';
import { somPenger, toKronerOgØre } from '@utils/locale';

import styles from './SkjønnsfastsettingHeader.module.css';

interface SkjønnsfastsettingHeaderProps {
    sykepengegrunnlag: number;
    endretSykepengegrunnlag: Maybe<number>;
    harBlittSkjønnsmessigFastsatt: boolean;
    sykepengegrunnlagsgrense: Sykepengegrunnlagsgrense;
    avviksprosent: number;
    editing: boolean;
    setEditing: (state: boolean) => void;
}

export const SkjønnsfastsettingHeader = ({
    sykepengegrunnlag,
    endretSykepengegrunnlag,
    harBlittSkjønnsmessigFastsatt,
    sykepengegrunnlagsgrense,
    avviksprosent,
    editing,
    setEditing,
}: SkjønnsfastsettingHeaderProps) => {
    const person = useCurrentPerson();
    const readonly = useIsReadOnlyOppgave();
    if (!person) return <></>;

    const visningEndretSykepengegrunnlag = endretSykepengegrunnlag
        ? endretSykepengegrunnlag > sykepengegrunnlagsgrense.grense
            ? sykepengegrunnlagsgrense.grense
            : endretSykepengegrunnlag
        : null;
    const visningharEndring = visningEndretSykepengegrunnlag && visningEndretSykepengegrunnlag !== sykepengegrunnlag;

    return (
        <div className={styles.header}>
            {!editing && (
                <>
                    <Bold className={styles.label}>Sykepengegrunnlag</Bold>
                    <div className={styles.beløp}>
                        {visningharEndring && <Endringstrekant />}
                        <BodyShort>{somPenger(visningEndretSykepengegrunnlag ?? sykepengegrunnlag)}</BodyShort>
                    </div>
                    {visningharEndring && (
                        <p className={styles.opprinneligSykepengegrunnlag}>{toKronerOgØre(sykepengegrunnlag)}</p>
                    )}
                    {harBlittSkjønnsmessigFastsatt && (
                        <Kilde type={Kildetype.Saksbehandler} className={styles.kildeIkon}>
                            <CaseworkerFilled title="Caseworker-ikon" height={20} width={20} />
                        </Kilde>
                    )}
                </>
            )}
            {kanSkjønnsfastsetteSykepengegrunnlag && !readonly && avviksprosent > 25 && (
                <EditButton
                    isOpen={editing}
                    openText="Avbryt"
                    closedText="Skjønnsfastsett"
                    onOpen={() => setEditing(true)}
                    onClose={() => setEditing(false)}
                    className={styles.redigeringsknapp}
                />
            )}
        </div>
    );
};
