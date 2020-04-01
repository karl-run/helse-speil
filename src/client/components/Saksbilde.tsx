import React, { ReactNode, useContext } from 'react';
import Vilkår from '../routes/Vilkår';
import PersonBar from './PersonBar';
import Tidslinje from './Tidslinje';
import Høyremeny from './Høyremeny';
import Sakslinje from '@navikt/helse-frontend-sakslinje';
import Venstremeny from './Venstremeny';
import Oppsummering from '../routes/Oppsummering';
import EmptyStateView from './EmptyStateView';
import Inntektskilder from '../routes/Inntektskilder/Inntektskilder';
import Sykepengegrunnlag from '../routes/Sykepengegrunnlag';
import Vedtaksperiodeinfo from './Vedtaksperiodeinfo';
import Sykmeldingsperiode from '../routes/Sykmeldingsperiode';
import Utbetalingsoversikt from '../routes/Utbetalingsoversikt';
import { Route } from 'react-router-dom';
import { PersonContext } from '../context/PersonContext';
import styled from '@emotion/styled';
import { Hendelse, Hendelsestype } from '../context/types';
import { Hendelsetype as LoggHendelsestype, LoggHeader, LoggProvider } from '@navikt/helse-frontend-logg';
import { Location, useNavigation } from '../hooks/useNavigation';
import { NORSK_DATOFORMAT } from '../utils/date';
import Varsel, { Varseltype } from '@navikt/helse-frontend-varsel';
import { mapVilkår, Vilkårstype, VurdertVilkår } from '../routes/Vilkår/vilkårsmapper';
import {
    alder,
    dagerIgjen,
    kravTilSykepengegrunnlag,
    opptjeningstid,
    søknadsfrist
} from '../routes/Vilkår/Vilkårsgrupper/Vilkårsgrupper';
import { Vilkårdata } from '../routes/Vilkår/Vilkår';

const Container = styled.div`
    display: flex;
    flex: 1;
    min-width: max-content;
    box-sizing: border-box;
`;

const Hovedinnhold = styled.div`
    flex: 1;
    overflow-x: scroll;
`;

const StyledSakslinje = styled(Sakslinje)`
    border: none;
    border-bottom: 1px solid #c6c2bf;
    > div:first-of-type {
        width: 250px;
    }
    > div:last-of-type {
        width: 210px;
    }
`;

const navnForHendelse = (hendelse: Hendelse) => {
    switch (hendelse.type) {
        case Hendelsestype.Inntektsmelding:
            return 'Inntektsmelding mottatt';
        case Hendelsestype.Søknad:
            return 'Søknad mottatt';
        case Hendelsestype.Sykmelding:
            return 'Sykmelding mottatt';
        default:
            return 'Hendelse';
    }
};

const hendelseFørsteDato = (hendelse: Hendelse) =>
    hendelse.type === Hendelsestype.Inntektsmelding ? hendelse.mottattTidspunkt : hendelse.rapportertDato;

const datoForHendelse = (hendelse: Hendelse) => {
    const dato = hendelseFørsteDato(hendelse);
    return dato ? dato.format(NORSK_DATOFORMAT) : 'Ukjent dato';
};

const Saksbilde = () => {
    const { toString } = useNavigation();
    const { aktivVedtaksperiode, personTilBehandling } = useContext(PersonContext);

    if (aktivVedtaksperiode === undefined || personTilBehandling === undefined) {
        console.warn(
            'Aktiv vedtaksperiode eller personTilBehandling er undefined',
            aktivVedtaksperiode,
            personTilBehandling
        );
        return null;
    }

    const dokumenter = aktivVedtaksperiode
        ? aktivVedtaksperiode.hendelser.map((hendelse: Hendelse) => ({
              id: hendelse.id,
              dato: datoForHendelse(hendelse),
              navn: navnForHendelse(hendelse),
              type: LoggHendelsestype.Dokumenter
          }))
        : [];

    if (!personTilBehandling) {
        return (
            <>
                <PersonBar />
                <Tidslinje />
                <Sakslinje />
                <Container>
                    <Venstremeny />
                    <EmptyStateView />
                    <Høyremeny />
                </Container>
            </>
        );
    }

    const { vilkår } = aktivVedtaksperiode!;

    const tilVilkårsgruppe = (vurdertVilkår: VurdertVilkår): ReactNode => {
        switch (vurdertVilkår.vilkår) {
            case Vilkårstype.Alder:
                return alder(vilkår.alder);
            case Vilkårstype.Søknadsfrist:
                return vilkår.søknadsfrist !== undefined ? søknadsfrist(vilkår.søknadsfrist) : undefined;
            case Vilkårstype.Opptjeningstid:
                return vilkår.opptjening !== undefined
                    ? opptjeningstid(vilkår.opptjening, vilkår.dagerIgjen?.førsteFraværsdag)
                    : undefined;
            case Vilkårstype.KravTilSykepengegrunnlag:
                return kravTilSykepengegrunnlag(vilkår.sykepengegrunnlag, vilkår.alder.alderSisteSykedag);
            case Vilkårstype.DagerIgjen:
                return vilkår.dagerIgjen !== undefined ? dagerIgjen(vilkår.dagerIgjen) : undefined;
        }
    };

    const vurderteVilkår: Vilkårdata[] = mapVilkår(vilkår).map(vilkår => ({
        type: vilkår.vilkår,
        komponent: tilVilkårsgruppe(vilkår),
        oppfylt: vilkår.oppfylt
    }));

    const alleVilkårOppfylt = () => Object.values(vilkår).find(v => !v.oppfylt) === undefined;

    return (
        <>
            <PersonBar />
            <Tidslinje />
            <LoggProvider hendelser={dokumenter}>
                <StyledSakslinje
                    venstre={<div />}
                    midt={<Vedtaksperiodeinfo periode={aktivVedtaksperiode} person={personTilBehandling} />}
                    høyre={<LoggHeader />}
                />
                <Container>
                    <Venstremeny />
                    <Hovedinnhold>
                        {!alleVilkårOppfylt() && (
                            <Varsel type={Varseltype.Feil}>Vilkår er ikke oppfylt i deler av perioden</Varsel>
                        )}
                        <Route
                            path={`${toString(Location.Sykmeldingsperiode)}/:aktoerId`}
                            component={Sykmeldingsperiode}
                        />
                        <Route
                            path={`${toString(Location.Vilkår)}/:aktoerId`}
                            component={() => <Vilkår vilkår={vurderteVilkår} />}
                        />
                        <Route path={`${toString(Location.Inntektskilder)}/:aktoerId`} component={Inntektskilder} />
                        <Route
                            path={`${toString(Location.Sykepengegrunnlag)}/:aktoerId`}
                            component={Sykepengegrunnlag}
                        />
                        <Route
                            path={`${toString(Location.Utbetalingsoversikt)}/:aktoerId`}
                            component={Utbetalingsoversikt}
                        />
                        <Route path={`${toString(Location.Oppsummering)}/:aktoerId`} component={Oppsummering} />
                    </Hovedinnhold>
                    <Høyremeny />
                </Container>
            </LoggProvider>
        </>
    );
};

export default Saksbilde;
