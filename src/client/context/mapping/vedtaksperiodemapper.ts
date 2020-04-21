import {
    Aktivitet,
    Hendelse,
    Hendelsestype,
    Inntektskilde,
    Oppsummering,
    Personinfo,
    Simulering,
    UferdigVedtaksperiode,
    Vedtaksperiode,
    Vedtaksperiodetilstand
} from '../types';
import dayjs, { Dayjs } from 'dayjs';
import {
    SpleisDataForSimulering,
    SpleisHendelse,
    SpleisHendelsetype,
    SpleisInntektsmelding,
    SpleisSimuleringperiode,
    SpleisSimuleringutbetaling,
    SpleisSimuleringutbetalingDetaljer,
    SpleisSykdomsdag,
    SpleisSykdomsdagtype,
    SpleisSykmelding,
    SpleisSøknad,
    SpesialistVedtaksperiode,
    SpleisVedtaksperiodetilstand,
    Utbetaling,
    Utbetalingsdetalj,
    Utbetalingsperiode
} from './external.types';
import { tilSykdomstidslinje, tilUtbetalingstidslinje } from './dagmapper';
import { ISO_DATOFORMAT, ISO_TIDSPUNKTFORMAT } from '../../utils/date';
import {
    aldersVilkår,
    dagerIgjenVilkår,
    opptjeningsVilkår,
    sykepengegrunnlagsVilkår,
    søknadsfristVilkår
} from './vilkårsmapper';

export const somDato = (dato: string): Dayjs => dayjs(dato, ISO_DATOFORMAT);
export const somKanskjeDato = (dato?: string): Dayjs | undefined => (dato ? somDato(dato) : undefined);
export const somTidspunkt = (dato: string): Dayjs => dayjs(dato, ISO_TIDSPUNKTFORMAT);

export const mapUferdigVedtaksperiode = (periode: SpesialistVedtaksperiode): UferdigVedtaksperiode => ({
    id: periode.id,
    fom: dayjs(periode.fom),
    tom: dayjs(periode.tom),
    kanVelges: false,
    tilstand: Vedtaksperiodetilstand.Ukjent
});

export const tilHendelse = (hendelse: SpleisHendelse): Hendelse => {
    switch (hendelse.type) {
        case SpleisHendelsetype.INNTEKTSMELDING:
            return {
                id: hendelse.id,
                type: Hendelsestype.Inntektsmelding,
                beregnetInntekt: (hendelse as SpleisInntektsmelding).beregnetInntekt,
                mottattTidspunkt: somTidspunkt((hendelse as SpleisInntektsmelding).mottattDato)
            };
        case SpleisHendelsetype.SØKNAD_ARBEIDSGIVER:
        case SpleisHendelsetype.SØKNAD_NAV:
            return {
                id: (hendelse as SpleisSøknad).id,
                type: Hendelsestype.Søknad,
                fom: somDato((hendelse as SpleisSøknad).fom),
                tom: somDato((hendelse as SpleisSøknad).tom),
                sendtNav: somDato(((hendelse as SpleisSøknad) as SpleisSøknad).sendtNav),
                rapportertDato: somKanskjeDato((hendelse as SpleisSøknad).rapportertdato)
            };
        case SpleisHendelsetype.SYKMELDING:
            return {
                id: (hendelse as SpleisSykmelding).id,
                type: Hendelsestype.Sykmelding,
                fom: somDato((hendelse as SpleisSykmelding).fom),
                tom: somDato((hendelse as SpleisSykmelding).tom),
                rapportertDato: somKanskjeDato((hendelse as SpleisSykmelding).rapportertdato)
            };
    }
};

export const mapVedtaksperiode = (
    unmappedPeriode: SpesialistVedtaksperiode,
    personinfo: Personinfo,
    organisasjonsnummer: string
): Vedtaksperiode => {
    const somProsent = (avviksprosent: number): number => avviksprosent * 100;
    const somInntekt = (inntekt?: number, måneder: number = 1): number | undefined =>
        inntekt ? +(inntekt * måneder).toFixed(2) : undefined;
    const somÅrsinntekt = (inntekt?: number): number | undefined => somInntekt(inntekt, 12);
    const spleisPeriode = filtrerPaddedeArbeidsdager(unmappedPeriode);

    const sykdomstidslinje = tilSykdomstidslinje(spleisPeriode.sykdomstidslinje);
    const utbetalingstidslinje = tilUtbetalingstidslinje(spleisPeriode.utbetalingstidslinje);

    const { vilkår } = unmappedPeriode;

    const inntektskilder: Inntektskilde[] = [
        {
            organisasjonsnummer,
            månedsinntekt: somInntekt(unmappedPeriode.inntektFraInntektsmelding),
            årsinntekt: somÅrsinntekt(unmappedPeriode.inntektFraInntektsmelding),
            refusjon: true,
            forskuttering: true
        }
    ];

    const sykepengegrunnlag = {
        årsinntektFraAording: unmappedPeriode.dataForVilkårsvurdering?.beregnetÅrsinntektFraInntektskomponenten,
        årsinntektFraInntektsmelding: somÅrsinntekt(unmappedPeriode.inntektFraInntektsmelding),
        avviksprosent: somProsent(unmappedPeriode.dataForVilkårsvurdering?.avviksprosent)
    };

    const oppsummering: Oppsummering = {
        antallUtbetalingsdager: unmappedPeriode.utbetalingstidslinje.filter(dag => dag.utbetaling && dag.utbetaling > 0)
            .length,
        totaltTilUtbetaling: unmappedPeriode.totalbeløpArbeidstaker
    };

    const mapTilstand = (tilstand: SpleisVedtaksperiodetilstand): Vedtaksperiodetilstand => {
        const vedtaksperiodeTilstand = Vedtaksperiodetilstand[tilstand];
        if (vedtaksperiodeTilstand === undefined) return Vedtaksperiodetilstand.Ukjent;
        else return vedtaksperiodeTilstand;
    };

    const aktivitetslogg: Aktivitet[] = unmappedPeriode.aktivitetslogg.map(aktivitet => ({
        melding: aktivitet.melding,
        alvorlighetsgrad: aktivitet.alvorlighetsgrad,
        tidsstempel: somTidspunkt(aktivitet.tidsstempel)
    }));

    return {
        id: unmappedPeriode.id,
        fom: somDato(unmappedPeriode.fom),
        tom: somDato(unmappedPeriode.tom),
        gruppeId: unmappedPeriode.gruppeId,
        kanVelges:
            ![SpleisVedtaksperiodetilstand.IngenUtbetaling, SpleisVedtaksperiodetilstand.Utbetalt].includes(
                spleisPeriode.tilstand
            ) || unmappedPeriode.totalbeløpArbeidstaker > 0,
        tilstand: mapTilstand(unmappedPeriode.tilstand),
        utbetalingsreferanse: unmappedPeriode.utbetalingsreferanse,
        utbetalingstidslinje: utbetalingstidslinje,
        sykdomstidslinje: sykdomstidslinje,
        godkjentAv: unmappedPeriode.godkjentAv,
        godkjenttidspunkt: somKanskjeDato(unmappedPeriode.godkjenttidspunkt),
        vilkår:
            vilkår !== null
                ? {
                      alder: aldersVilkår(vilkår),
                      dagerIgjen: dagerIgjenVilkår(vilkår),
                      opptjening: opptjeningsVilkår(vilkår),
                      søknadsfrist: søknadsfristVilkår(vilkår),
                      sykepengegrunnlag: sykepengegrunnlagsVilkår(vilkår)
                  }
                : undefined,
        inntektskilder: inntektskilder,
        sykepengegrunnlag: sykepengegrunnlag,
        oppsummering: oppsummering,
        simuleringsdata: unmappedPeriode.simuleringsdata
            ? mapSimuleringsdata(unmappedPeriode.simuleringsdata)
            : undefined,
        hendelser: unmappedPeriode.hendelser.map(tilHendelse),
        aktivitetslog: aktivitetslogg,
        rawData: unmappedPeriode
    };
};

const mapSimuleringsdata = (data: SpleisDataForSimulering): Simulering => ({
    totalbeløp: data.totalbeløp,
    perioder: mapSimuleringsperioder(data.perioder)
});

const mapSimuleringsperioder = (perioder: SpleisSimuleringperiode[]): Utbetalingsperiode[] =>
    perioder.map(spleisPeriode => ({
        fom: spleisPeriode.fom,
        tom: spleisPeriode.tom,
        utbetalinger: mapSimuleringsutbetalinger(spleisPeriode.utbetalinger)
    }));

const mapSimuleringsutbetalinger = (utbetalinger: SpleisSimuleringutbetaling[]): Utbetaling[] =>
    utbetalinger.map(spleisSimuleringsutbetaling => ({
        detaljer: mapSimuleringsutbetalingDetaljer(spleisSimuleringsutbetaling.detaljer),
        feilkonto: spleisSimuleringsutbetaling.feilkonto,
        forfall: spleisSimuleringsutbetaling.forfall,
        utbetalesTilId: spleisSimuleringsutbetaling.utbetalesTilId,
        utbetalesTilNavn: spleisSimuleringsutbetaling.utbetalesTilNavn
    }));

const mapSimuleringsutbetalingDetaljer = (
    spleisSimuleringsutbetalingDetaljer: SpleisSimuleringutbetalingDetaljer[]
): Utbetalingsdetalj[] =>
    spleisSimuleringsutbetalingDetaljer.map(spleisDetaljer => ({
        antallSats: spleisDetaljer.antallSats,
        belop: spleisDetaljer.beløp,
        faktiskFom: spleisDetaljer.faktiskFom,
        faktiskTom: spleisDetaljer.faktiskTom,
        klassekode: spleisDetaljer.klassekode,
        klassekodeBeskrivelse: spleisDetaljer.klassekodeBeskrivelse,
        konto: spleisDetaljer.konto,
        refunderesOrgNr: spleisDetaljer.refunderesOrgNr,
        sats: spleisDetaljer.sats,
        tilbakeforing: spleisDetaljer.tilbakeføring,
        typeSats: spleisDetaljer.typeSats,
        uforegrad: spleisDetaljer.uføregrad,
        utbetalingsType: spleisDetaljer.utbetalingstype
    }));

const filtrerPaddedeArbeidsdager = (vedtaksperiode: SpesialistVedtaksperiode): SpesialistVedtaksperiode => {
    const arbeidsdagEllerImplisittDag = (dag: SpleisSykdomsdag) =>
        dag.type === SpleisSykdomsdagtype.ARBEIDSDAG_INNTEKTSMELDING ||
        dag.type === SpleisSykdomsdagtype.ARBEIDSDAG_SØKNAD ||
        dag.type === SpleisSykdomsdagtype.IMPLISITT_DAG;
    const førsteArbeidsdag = vedtaksperiode.sykdomstidslinje.findIndex(arbeidsdagEllerImplisittDag);
    if (førsteArbeidsdag !== 0) return vedtaksperiode;

    const førsteIkkeArbeidsdag = vedtaksperiode.sykdomstidslinje.findIndex(
        dag =>
            dag.type !== SpleisSykdomsdagtype.ARBEIDSDAG_INNTEKTSMELDING &&
            dag.type !== SpleisSykdomsdagtype.ARBEIDSDAG_SØKNAD &&
            dag.type !== SpleisSykdomsdagtype.IMPLISITT_DAG
    );

    return {
        ...vedtaksperiode,
        sykdomstidslinje: [...vedtaksperiode.sykdomstidslinje.slice(førsteIkkeArbeidsdag)]
    };
};
