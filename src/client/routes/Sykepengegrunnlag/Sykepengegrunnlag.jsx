import React, { useContext } from 'react';
import ListRow from '../../components/Rows/ListRow';
import IconRow from '../../components/Rows/IconRow';
import Navigasjonsknapper from '../../components/NavigationButtons';
import { Panel } from 'nav-frontend-paneler';
import { pages } from '../../hooks/useLinks';
import { item } from '../../datamapping/mappingUtils';
import { PersonContext } from '../../context/PersonContext';
import { toLocaleFixedNumberString } from '../../utils/locale';
import './Sykepengegrunnlag.less';

const Sykepengegrunnlag = () => {
    const { inntektskilder } = useContext(PersonContext).personTilBehandling;
    const inntektsmeldingItems = inntektskilder && [
        item(
            'Beregnet månedsinntekt',
            `${toLocaleFixedNumberString(inntektskilder.månedsinntekt, 2)} kr`
        ),
        item('Omregnet årsinntekt', `${toLocaleFixedNumberString(inntektskilder.årsinntekt, 2)} kr`)
    ];

    return (
        <Panel className="tekstbolker Sykepengegrunnlag">
            {inntektskilder && (
                <>
                    <ListRow
                        label="Hentet fra inntektsmeldingen"
                        items={inntektsmeldingItems}
                        showIcon={false}
                    />
                    <IconRow label="A-ordningen må sjekkes manuelt" iconType="advarsel" />
                    <IconRow label="Avvik må sjekkes manuelt" iconType="advarsel" />
                </>
            )}
            <Navigasjonsknapper previous={pages.INNTEKTSKILDER} next={pages.UTBETALINGSOVERSIKT} />
        </Panel>
    );
};

export default Sykepengegrunnlag;
