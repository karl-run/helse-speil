import {
    ForlengelseEtikett,
    FørstegangsbehandlingEtikett,
    InfotrygdforlengelseEtikett,
    RevurderingEtikett,
    RiskQaEtikett,
    StikkprøveEtikett,
} from '../../oversikt/Oppgaveetikett';
import { Sykmeldingsperiodeikon } from '../../../components/ikoner/Sykmeldingsperiodeikon';
import { Maksdatoikon } from '../../../components/ikoner/Maksdatoikon';
import { Skjæringstidspunktikon } from '../../../components/ikoner/Skjæringstidspunktikon';
import React from 'react';
import styled from '@emotion/styled';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';
import { Clipboard } from '../../../components/clipboard';
import { useSykepengegrunnlag } from '../../../state/person';
import { Flex } from '../../../components/Flex';
import { somPenger } from '../../../utils/locale';
import { Arbeidsforhold, Dagtype, Periodetype } from 'internal-types';
import { NORSK_DATOFORMAT, NORSK_DATOFORMAT_KORT } from '../../../utils/date';
import {
    Periodetype as Historikkperiodetype,
    Tidslinjeperiode,
    useGjenståendeDager,
    useNettobeløp,
} from '../../../modell/UtbetalingshistorikkElement';
import { Dayjs } from 'dayjs';
import { useOppgavereferanse, useVedtaksperiode } from '../../../state/tidslinje';
import { Utbetalingsdialog } from '../utbetaling/Oppsummering/utbetaling/Utbetalingsdialog';
import { getAnonymArbeidsgiverForOrgnr } from '../../../agurkdata';
import { Vilkårsliste } from '../utbetaling/Vilkårsoversikt';

const Kort = styled.section`
    padding-bottom: 0;
    &:not(:last-of-type) {
        margin-bottom: 2rem;
    }
`;

const Korttittel = styled(Undertittel)`
    display: flex;
    align-items: center;
    font-size: 16px;
    margin-bottom: 0.25rem;

    a {
        color: inherit;

        &:hover {
            text-decoration: none;
        }

        &:active,
        &:focus {
            outline: none;
            color: var(--navds-color-text-inverse);
            text-decoration: none;
            background-color: var(--navds-text-focus);
            box-shadow: 0 0 0 2px var(--navds-text-focus);
        }
    }
`;

const StyledUndertekstBold = styled(UndertekstBold)`
    letter-spacing: 0.4px;
    color: #59514b;
`;

const PeriodetypeEtikett = (periode: Tidslinjeperiode) => {
    const vedtaksperiode = useVedtaksperiode(periode.id);
    if (periode.type === Historikkperiodetype.REVURDERING)
        return <RevurderingEtikett medLabel label={<StyledUndertekstBold>REVURDERINGSPERIODE</StyledUndertekstBold>} />;
    switch (vedtaksperiode?.periodetype) {
        case Periodetype.Infotrygdforlengelse:
        case Periodetype.Forlengelse:
            return <ForlengelseEtikett medLabel label={<StyledUndertekstBold>FORLENGELSE</StyledUndertekstBold>} />;
        case Periodetype.Førstegangsbehandling:
            return (
                <FørstegangsbehandlingEtikett
                    medLabel
                    label={<StyledUndertekstBold>FØRSTEGANGSBEHANDLING</StyledUndertekstBold>}
                />
            );
        case Periodetype.OvergangFraInfotrygd:
            return (
                <InfotrygdforlengelseEtikett
                    medLabel
                    label={<StyledUndertekstBold>INFOTRYGDFORLENGELSE</StyledUndertekstBold>}
                />
            );
        case Periodetype.Stikkprøve:
            return <StikkprøveEtikett medLabel label={<StyledUndertekstBold>STIKKPRØVE</StyledUndertekstBold>} />;
        case Periodetype.RiskQa:
            return <RiskQaEtikett medLabel label={<StyledUndertekstBold>RISK QA</StyledUndertekstBold>} />;
        default:
            return null;
    }
};

interface PeriodeKortProps {
    aktivPeriode: Tidslinjeperiode;
    maksdato: string;
    gjenståendeDager: number;
    skjæringstidspunkt: string;
}

export const PeriodeKort = ({ aktivPeriode, maksdato, skjæringstidspunkt, gjenståendeDager }: PeriodeKortProps) => {
    const periode = `${aktivPeriode.fom.format(NORSK_DATOFORMAT_KORT)} - ${aktivPeriode.tom.format(
        NORSK_DATOFORMAT_KORT
    )}`;

    return (
        <Kort>
            <Korttittel>{PeriodetypeEtikett(aktivPeriode)}</Korttittel>
            <IkonOgTekst tekst={periode} Ikon={<Sykmeldingsperiodeikon />} />
            <IkonOgTekst tekst={skjæringstidspunkt} Ikon={<Skjæringstidspunktikon />} />
            <IkonOgTekst tekst={`${maksdato} (${gjenståendeDager} dager igjen)`} Ikon={<Maksdatoikon />} />
        </Kort>
    );
};

interface ArbeidsgiverKortProps {
    arbeidsgivernavn: string;
    organisasjonsnummer: string;
    arbeidsforhold: Arbeidsforhold[];
    anonymiseringEnabled?: boolean;
}

export const ArbeidsgiverKort = ({
    arbeidsgivernavn,
    organisasjonsnummer,
    arbeidsforhold,
    anonymiseringEnabled = false,
}: ArbeidsgiverKortProps) => {
    return (
        <Kort>
            <Korttittel>
                <StyledUndertekstBold>
                    {anonymiseringEnabled
                        ? getAnonymArbeidsgiverForOrgnr(organisasjonsnummer).navn.toUpperCase()
                        : arbeidsgivernavn.toUpperCase()}
                </StyledUndertekstBold>
            </Korttittel>
            <Clipboard preserveWhitespace={false} copyMessage="Organisasjonsnummer er kopiert">
                <Normaltekst>
                    {anonymiseringEnabled
                        ? getAnonymArbeidsgiverForOrgnr(organisasjonsnummer).orgnr
                        : organisasjonsnummer}
                </Normaltekst>
            </Clipboard>
            {arbeidsforhold.map((e, i) => (
                <React.Fragment key={i}>
                    <Normaltekst>{`${
                        anonymiseringEnabled ? 'Agurkifisert stillingstittel' : titleCase(e.stillingstittel)
                    }, ${e.stillingsprosent} %`}</Normaltekst>
                    <Normaltekst>
                        {e.startdato.format(NORSK_DATOFORMAT)}
                        {e.sluttdato && ' - ' && e.sluttdato.format(NORSK_DATOFORMAT)}
                    </Normaltekst>
                </React.Fragment>
            ))}
        </Kort>
    );
};

interface VilkårKortProps {
    aktivPeriode: Tidslinjeperiode;
}

const VilkårKort = ({ aktivPeriode }: VilkårKortProps) => {
    const vedtaksperiode = useVedtaksperiode(aktivPeriode.id);

    if (!vedtaksperiode) return null;

    return (
        <Kort>
            <Korttittel>
                <StyledUndertekstBold>VILKÅR</StyledUndertekstBold>
            </Korttittel>
            <Vilkårsliste vedtaksperiode={vedtaksperiode} />
        </Kort>
    );
};

interface UtbetalingKortProps {
    beregningId: string;
    utbetalingsdagerTotalt: number;
    nettobeløp: number;
}

export const UtbetalingKort = ({ beregningId, utbetalingsdagerTotalt, nettobeløp }: UtbetalingKortProps) => {
    const sykepengegrunnlag = useSykepengegrunnlag(beregningId);
    return (
        <Kort>
            <Korttittel>
                <StyledUndertekstBold>TIL UTBETALING</StyledUndertekstBold>
            </Korttittel>
            <Flex justifyContent="space-between">
                <Normaltekst>Sykepengegrunnlag:</Normaltekst>
                <Normaltekst>{somPenger(sykepengegrunnlag?.sykepengegrunnlag)}</Normaltekst>
            </Flex>
            <Flex justifyContent="space-between">
                <Normaltekst>Totalt antall utbetalingdager:</Normaltekst>
                <Normaltekst>{utbetalingsdagerTotalt}</Normaltekst>
            </Flex>
            <Flex justifyContent="space-between">
                <Normaltekst>Til utbetaling nå:</Normaltekst>
                <Normaltekst>{nettobeløp}</Normaltekst>
            </Flex>
        </Kort>
    );
};

interface IkonOgTekstProps {
    Ikon: React.ReactNode;
    tekst: string;
}

const IkonOgTekst = ({ Ikon, tekst }: IkonOgTekstProps) => {
    return (
        <Flex alignItems={'center'}>
            {Ikon}
            <Normaltekst style={{ marginLeft: '1rem' }}>{tekst}</Normaltekst>
        </Flex>
    );
};

const Arbeidsflate = styled.section`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 19.5rem;
    min-width: 19.5rem;
    padding: 2rem 1.5rem;
`;

export const VertikalStrek = styled.div`
    width: 1px;
    background: var(--navds-color-border);
    margin: 0;
`;

interface VenstreMenyProps {
    aktivPeriode: Tidslinjeperiode;
    arbeidsgivernavn: string;
    organisasjonsnummer: string;
    arbeidsforhold: Arbeidsforhold[];
    maksdato?: Dayjs;
    skjæringstidspunkt?: Dayjs;
    anonymiseringEnabled: boolean;
}

export const VenstreMeny = ({
    aktivPeriode,
    maksdato,
    arbeidsgivernavn,
    organisasjonsnummer,
    arbeidsforhold,
    anonymiseringEnabled,
    skjæringstidspunkt,
}: VenstreMenyProps) => {
    const gjenståendeDager = useGjenståendeDager(aktivPeriode.beregningId);
    const utbetalingsdagerTotalt = aktivPeriode.utbetalingstidslinje.filter((dag) => dag.type === Dagtype.Syk).length;
    const nettobeløp = useNettobeløp(aktivPeriode.beregningId);
    const oppgavereferanse = useOppgavereferanse(aktivPeriode.beregningId);

    return (
        <Arbeidsflate>
            <PeriodeKort
                aktivPeriode={aktivPeriode}
                maksdato={maksdato?.format(NORSK_DATOFORMAT_KORT) ?? 'Ukjent maksdato'}
                skjæringstidspunkt={skjæringstidspunkt?.format(NORSK_DATOFORMAT) ?? 'Ukjent skjæringstidspunkt'}
                gjenståendeDager={gjenståendeDager}
            />
            <ArbeidsgiverKort
                arbeidsgivernavn={arbeidsgivernavn}
                organisasjonsnummer={organisasjonsnummer}
                arbeidsforhold={arbeidsforhold}
                anonymiseringEnabled={anonymiseringEnabled}
            />
            <VilkårKort aktivPeriode={aktivPeriode} />
            <UtbetalingKort
                beregningId={aktivPeriode.beregningId}
                utbetalingsdagerTotalt={utbetalingsdagerTotalt}
                nettobeløp={nettobeløp}
            />
            <Utbetalingsdialog
                oppgavereferanse={oppgavereferanse}
                godkjenningsknappTekst={aktivPeriode.type === Historikkperiodetype.REVURDERING ? 'Revurder' : 'Utbetal'}
            />
        </Arbeidsflate>
    );
};

const titleCase = (str: string) => {
    return str.replace(/\w\S*/g, (t) => {
        return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
    });
};
