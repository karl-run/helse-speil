import { Subsumsjon } from '../../routes/saksbilde/sykepengegrunnlag/overstyring.types';

export interface Options {
    method?: string;
    headers?: { [key: string]: any };
}

export type OverstyrtDagtype =
    | 'Sykedag'
    | 'Feriedag'
    | 'Egenmeldingsdag'
    | 'Permisjonsdag'
    | 'Avvist'
    | 'Arbeidsdag'
    | 'SykedagNav';

export interface OverstyrtDagDTO {
    dato: string;
    type: OverstyrtDagtype;
    fraType: OverstyrtDagtype;
    grad?: number;
    fraGrad?: number;
}

interface Overstyring {
    aktørId: string;
    fødselsnummer: string;
    organisasjonsnummer: string;
    begrunnelse: string;
}

export interface OverstyrteDagerDTO extends Overstyring {
    dager: OverstyrtDagDTO[];
}

export interface OverstyrtInntektDTO extends Overstyring {
    månedligInntekt: number;
    fraMånedligInntekt: number;
    skjæringstidspunkt: string;
    forklaring: string;
    subsumsjon?: Subsumsjon;
    refusjonsopplysninger?: Refusjonsopplysning[];
    fraRefusjonsopplysninger?: Refusjonsopplysning[];
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
    subsumsjon?: Subsumsjon;
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
    subsumsjon?: Subsumsjon;
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
