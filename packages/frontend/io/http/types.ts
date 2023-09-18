import { Lovhjemmel } from '../../routes/saksbilde/sykepengegrunnlag/overstyring/overstyring.types';

export interface Options {
    method?: string;
    headers?: { [key: string]: unknown };
}

export type OverstyrtDagtype =
    | 'Sykedag'
    | 'SykedagNav'
    | 'Feriedag'
    | 'Egenmeldingsdag'
    | 'Permisjonsdag'
    | 'Avvistdag'
    | 'ArbeidIkkeGjenopptattDag'
    | 'Arbeidsdag'
    | 'Foreldrepengerdag'
    | 'AAPdag'
    | 'Omsorgspengerdag'
    | 'Pleiepengerdag'
    | 'Svangerskapspengerdag'
    | 'Opplaringspengerdag'
    | 'Dagpengerdag';

export interface OverstyrtDagDTO {
    dato: string;
    type: OverstyrtDagtype;
    fraType: OverstyrtDagtype;
    grad?: number;
    fraGrad?: number;
    lovhjemmel?: Lovhjemmel;
}

export interface OverstyrtTidslinjeDTO {
    aktørId: string;
    fødselsnummer: string;
    organisasjonsnummer: string;
    begrunnelse: string;
    vedtaksperiodeId: string;
    dager: OverstyrtDagDTO[];
}

export interface OverstyrtInntektOgRefusjonDTO {
    aktørId: string;
    fødselsnummer: string;
    skjæringstidspunkt: string;
    arbeidsgivere: OverstyrtInntektOgRefusjonArbeidsgiver[];
}

export interface OverstyrtInntektOgRefusjonArbeidsgiver {
    organisasjonsnummer: string;
    månedligInntekt: number;
    fraMånedligInntekt: number;
    refusjonsopplysninger: Refusjonsopplysning[];
    fraRefusjonsopplysninger: Refusjonsopplysning[];
    forklaring: string;
    begrunnelse: string;
    subsumsjon?: Lovhjemmel;
}

export interface Refusjonsopplysning {
    fom: string;
    tom?: Maybe<string>;
    beløp: number;
    kilde: string;
}

export interface OverstyrtArbeidsforholdDTO {
    fødselsnummer: string;
    aktørId: string;
    skjæringstidspunkt: string;
    overstyrteArbeidsforhold: OverstyrtArbeidsforholdElementDTO[];
}

export interface OverstyrtArbeidsforholdElementDTO {
    orgnummer: string;
    deaktivert: boolean;
    forklaring: string;
    begrunnelse: string;
    subsumsjon?: Lovhjemmel;
}

export interface SkjønnsfastsattSykepengegrunnlagDTO {
    aktørId: string;
    fødselsnummer: string;
    skjæringstidspunkt: string;
    arbeidsgivere: SkjønnsfastsattArbeidsgiver[];
}

export interface SkjønnsfastsattArbeidsgiver {
    organisasjonsnummer: string;
    årlig: number;
    fraÅrlig: number;
    årsak: string;
    begrunnelseMal?: string;
    begrunnelseFritekst?: string;
    begrunnelseKonklusjon?: string;
    lovhjemmel?: Lovhjemmel;
    initierendeVedtaksperiodeId: Maybe<string>;
}

export interface AnnulleringDTO {
    aktørId: string;
    fødselsnummer: string;
    organisasjonsnummer: string;
    fagsystemId: string;
    begrunnelser?: string[];
    kommentar?: string;
}

export interface PersonoppdateringDTO {
    fødselsnummer: string;
}

export interface NotatDTO {
    tekst: string;
    type: ExternalNotatType;
}
