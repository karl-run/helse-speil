import React from 'react';
import { Element, Undertittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import Navigasjonsknapper from '../../widgets/Navigasjonsknapper';
import ItemMapper from '../../../datamapping/beregningMapper';
import { withBehandlingContext } from '../../../context/BehandlingerContext';
import { beregningstekster, tekster } from '../../../tekster';
import ListRow from '../../widgets/rows/ListRow';
import IconRow from '../../widgets/rows/IconRow';
import { toKroner } from '../../../utils/locale';
import ListeSeparator from '../../widgets/ListeSeparator';

const Beregning = withBehandlingContext(({ behandling }) => {
    return (
        <Panel border className="Beregning">
            <Undertittel className="panel-tittel">
                {beregningstekster('tittel')}
            </Undertittel>
            {/* TODO: send inn riktig beløp til inntektsmeldingbolken */}
            <ListRow
                label={beregningstekster('inntektsmeldinger')}
                items={ItemMapper.inntektsmelding([321000])}
            />
            <ListRow
                label={beregningstekster('aordningen')}
                items={ItemMapper.aordning(
                    behandling.avklarteVerdier.sykepengegrunnlag.fastsattVerdi
                        .sykepengegrunnlagNårTrygdenYter.fastsattVerdi
                )}
                bold
            />
            {/* TODO: send inn riktig avvik til titleValue */}
            <IconRow label={beregningstekster('avvik')} value={'100 %'} bold />
            <IconRow
                label={beregningstekster('sykepengegrunnlag')}
                value={`${toKroner(321000)} kr`}
                bold
            />
            <IconRow
                label={beregningstekster('dagsats')}
                value={`${toKroner(behandling.beregning.dagsats)} kr`}
                bold
            />
            <ListeSeparator />
            <Element className="mvp-tittel">{tekster('mvp')}</Element>
            <IconRow label="Arbeidstaker" />
            <IconRow label="Kun 1 arbeidsforhold" />
            <IconRow label="Ingen andre ytelser" />
            <IconRow label="Ingen studier" />
            <IconRow label="Ingen utenlandsopphold" />
            <IconRow label="Ingen permisjon" />
            <IconRow label="Ikke 25% avvik" />
            <Navigasjonsknapper previous="/inngangsvilkår" next="/periode" />
        </Panel>
    );
});

export default Beregning;
