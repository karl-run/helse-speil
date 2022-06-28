import React from 'react';

import { Arbeidsgiver, BeregnetPeriode, Dag, Person, Utbetalingsdagtype } from '@io/graphql';

import { VilkårCard } from './VilkårCard';
import { PeriodeCard } from './PeriodeCard';
import { UtbetalingCard } from './UtbetalingCard';
import { ArbeidsgiverCard } from './ArbeidsgiverCard';

import styles from './Venstremeny.module.css';
import { Utbetaling } from './utbetaling/Utbetaling';
import { useCurrentVilkårsgrunnlag } from '@state/periode';

const getNumberOfDaysWithType = (timeline: Array<Dag>, type: Utbetalingsdagtype): number => {
    return timeline.filter((it) => it.utbetalingsdagtype === type).length;
};

interface VenstremenyBeregnetPeriodeProps {
    activePeriod: BeregnetPeriode;
    currentPerson: Person;
    currentArbeidsgiver: Arbeidsgiver;
    readOnly: boolean;
}

export const VenstremenyBeregnetPeriode: React.VFC<VenstremenyBeregnetPeriodeProps> = ({
    activePeriod,
    currentPerson,
    currentArbeidsgiver,
    readOnly,
}) => {
    const månedsbeløp = useCurrentVilkårsgrunnlag()?.inntekter.find(
        (it) => it.arbeidsgiver === currentArbeidsgiver.organisasjonsnummer,
    )?.omregnetArsinntekt?.manedsbelop;

    return (
        <section className={styles.Venstremeny}>
            <PeriodeCard activePeriod={activePeriod} />
            <ArbeidsgiverCard
                navn={currentArbeidsgiver.navn}
                organisasjonsnummer={currentArbeidsgiver.organisasjonsnummer}
                arbeidsforhold={currentArbeidsgiver.arbeidsforhold}
                månedsbeløp={månedsbeløp}
            />
            <VilkårCard activePeriod={activePeriod} currentPerson={currentPerson} />
            <UtbetalingCard
                skjæringstidspunkt={activePeriod.skjaeringstidspunkt}
                vilkårsgrunnlaghistorikkId={activePeriod.vilkarsgrunnlaghistorikkId}
                antallUtbetalingsdager={getNumberOfDaysWithType(activePeriod.tidslinje, Utbetalingsdagtype.Navdag)}
                utbetaling={activePeriod.utbetaling}
                arbeidsgiver={currentArbeidsgiver.navn}
                personinfo={currentPerson.personinfo}
                harRefusjon={!!activePeriod.refusjon}
                arbeidsgiversimulering={activePeriod.utbetaling.arbeidsgiversimulering}
                personsimulering={activePeriod.utbetaling.personsimulering}
            />
            {!readOnly && <Utbetaling activePeriod={activePeriod} currentPerson={currentPerson} />}
        </section>
    );
};
