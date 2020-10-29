import React, { ReactNode, useContext } from 'react';
import { Navigasjonsknapper } from '../../../components/Navigasjonsknapper';
import { MedPersonOgVedtaksperiode, PersonContext } from '../../../context/PersonContext';
import styled from '@emotion/styled';
import { BehandletVedtaksperiode, BehandletVedtaksperiodeFraInfotrygd } from './BehandletVedtaksperiode';
import { PåfølgendeVedtaksperiode } from './PåfølgendeVedtaksperiode';
import { Førstegangsbehandling } from './UbehandletVedtaksperiode';
import { Vedtaksperiode, Periodetype } from 'internal-types';
import { useKategoriserteVilkår, KategoriserteVilkår } from './useKategoriserteVilkår';
import { Vilkårstype } from '../../../mapping/vilkår';
import { førsteVedtaksperiode } from '../../../mapping/selectors';
import { Vilkårsgruppe } from './Vilkårsgrupper/Vilkårsgruppe';
import { AgurkErrorBoundary } from '../../../components/AgurkErrorBoundary';

const Footer = styled(Navigasjonsknapper)`
    margin: 2.5rem 2rem 2rem;
`;

export interface Vilkårdata {
    type: Vilkårstype;
    komponent: ReactNode;
    oppfylt?: boolean;
}

const filtrerBehandledeVilkår = (vilkår: Vilkårdata): boolean =>
    ![Vilkårstype.Opptjeningstid, Vilkårstype.Sykepengegrunnlag].includes(vilkår.type);

const tilKomponent = (vilkår: Vilkårdata): ReactNode => vilkår.komponent;

const oppfylteVilkårMedInstitusjon = (vilkårkomponenter: ReactNode[]) => [
    ...vilkårkomponenter,
    <Vilkårsgruppe tittel="Ingen institusjonsopphold" paragraf="§ 8-53 og 8-54" ikontype="ok" />,
];

interface VanligeVilkårProps {
    aktivVedtaksperiode: Vedtaksperiode;
    førsteVedtaksperiode: Vedtaksperiode;
    vilkår: KategoriserteVilkår;
}

const Vilkårsvisning = ({ aktivVedtaksperiode, førsteVedtaksperiode, vilkår }: VanligeVilkårProps) => {
    const { ikkeOppfylteVilkår, oppfylteVilkår, ikkeVurderteVilkår } = vilkår;

    if (aktivVedtaksperiode.behandlet) {
        return aktivVedtaksperiode.forlengelseFraInfotrygd ? (
            <BehandletVedtaksperiodeFraInfotrygd
                aktivVedtaksperiode={aktivVedtaksperiode}
                førsteVedtaksperiode={førsteVedtaksperiode}
            />
        ) : (
            <BehandletVedtaksperiode
                aktivVedtaksperiode={aktivVedtaksperiode}
                førsteVedtaksperiode={førsteVedtaksperiode}
            />
        );
    }
    switch (aktivVedtaksperiode.periodetype) {
        case Periodetype.Førstegangsbehandling:
            return (
                <Førstegangsbehandling
                    ikkeOppfylteVilkår={ikkeOppfylteVilkår.map(tilKomponent)}
                    oppfylteVilkår={oppfylteVilkårMedInstitusjon(oppfylteVilkår.map(tilKomponent))}
                    ikkeVurderteVilkår={ikkeVurderteVilkår}
                    risikovurdering={aktivVedtaksperiode.risikovurdering}
                />
            );
        case Periodetype.Forlengelse:
            return (
                <PåfølgendeVedtaksperiode
                    førsteVedtaksperiode={førsteVedtaksperiode}
                    ikkeOppfylteVilkår={ikkeOppfylteVilkår.filter(filtrerBehandledeVilkår).map(tilKomponent)}
                    oppfylteVilkår={oppfylteVilkårMedInstitusjon(
                        oppfylteVilkår.filter(filtrerBehandledeVilkår).map(tilKomponent)
                    )}
                    ikkeVurderteVilkår={ikkeVurderteVilkår}
                    risikovurdering={aktivVedtaksperiode.risikovurdering}
                />
            );
        case Periodetype.Infotrygdforlengelse:
            return (
                <PåfølgendeVedtaksperiode
                    førsteVedtaksperiode={førsteVedtaksperiode}
                    ikkeOppfylteVilkår={ikkeOppfylteVilkår.filter(filtrerBehandledeVilkår).map(tilKomponent)}
                    oppfylteVilkår={oppfylteVilkårMedInstitusjon(
                        oppfylteVilkår.filter(filtrerBehandledeVilkår).map(tilKomponent)
                    )}
                    ikkeVurderteVilkår={ikkeVurderteVilkår}
                    forlengelseFraInfotrygd={true}
                    risikovurdering={aktivVedtaksperiode.risikovurdering}
                />
            );
    }
};

const Vilkår = () => {
    const { aktivVedtaksperiode, personTilBehandling } = useContext(PersonContext) as MedPersonOgVedtaksperiode;
    const vilkår = useKategoriserteVilkår(aktivVedtaksperiode);

    if (!aktivVedtaksperiode || vilkår === undefined || personTilBehandling === undefined) return null;

    const førstePeriode = førsteVedtaksperiode(aktivVedtaksperiode, personTilBehandling!);
    return (
        <>
            <AgurkErrorBoundary sidenavn="Vilkår">
                <Vilkårsvisning
                    vilkår={vilkår}
                    aktivVedtaksperiode={aktivVedtaksperiode}
                    førsteVedtaksperiode={førstePeriode}
                />
            </AgurkErrorBoundary>
            <Footer />
        </>
    );
};

export default Vilkår;
