import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';

import { Tooltip } from '@navikt/ds-react';

import { Inntektskilde, Kildetype } from '@io/graphql';

interface KildeProps {
    type: KildeikonType;
    children?: ReactNode;
    className?: string;
}

type KildeikonType = Kildetype | Inntektskilde | 'AINNTEKT' | undefined;

const ainntektStyle = (props: KildeProps) =>
    props.type === 'AINNTEKT' &&
    css`
        background-color: var(--a-deepblue-100);
        border-color: var(--a-deepblue-500);
    `;

const aordningenStyle = (props: KildeProps) =>
    props.type === Inntektskilde.Aordningen &&
    css`
        background-color: var(--a-green-100);
        border-color: var(--a-green-500);
    `;

const sykmeldingStyle = (props: KildeProps) =>
    props.type === Kildetype.Sykmelding &&
    css`
        background-color: var(--a-lightblue-100);
        border-color: var(--a-blue-500);
    `;

const søknadStyle = (props: KildeProps) =>
    props.type === Kildetype.Soknad &&
    css`
        background-color: var(--a-purple-100);
        border-color: var(--a-purple-400);
    `;

const inntektsmeldingStyle = (props: KildeProps) =>
    props.type === Kildetype.Inntektsmelding &&
    css`
        background-color: var(--a-limegreen-100);
        border-color: var(--a-orange-600);
    `;

const saksbehandlerStyle = (props: KildeProps) =>
    (props.type === Kildetype.Saksbehandler || props.type === Inntektskilde.SkjonnsmessigFastsatt) &&
    css`
        background-color: var(--a-gray-100);
        color: var(--a-text-default);
        border-color: var(--a-gray-700);
        svg {
            width: 12px;
            height: 12px;
        }
    `;

const getKildeTypeTooltip = (kilde: KildeikonType): string => {
    switch (kilde) {
        case Inntektskilde.Inntektsmelding:
        case Kildetype.Inntektsmelding:
            return 'Inntektsmelding';
        case Kildetype.Soknad:
            return 'Søknad';
        case Kildetype.Sykmelding:
            return 'Sykmelding';
        case Kildetype.Saksbehandler:
            return 'Saksbehandler';
        case Inntektskilde.Aordningen:
            return 'A-ordningen';
        case Inntektskilde.IkkeRapportert:
            return 'Ikke rapportert';
        case Inntektskilde.Saksbehandler:
            return 'Saksbehandler';
        case 'AINNTEKT':
            return 'A-inntekt';
        case Inntektskilde.SkjonnsmessigFastsatt:
            return 'Skjønnsmessig fastsatt';
        default:
            return 'Ukjent';
    }
};

const Kildeikon = styled.div<KildeProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    background-color: transparent;
    color: var(--a-text-default);
    width: 1.25rem;
    height: 1rem;
    cursor: default;

    .Tekst {
        letter-spacing: 0.5px;
    }

    ${ainntektStyle};
    ${aordningenStyle};
    ${sykmeldingStyle};
    ${søknadStyle};
    ${inntektsmeldingStyle};
    ${saksbehandlerStyle};
`;

const erTekst = (kilde: KildeikonType): boolean =>
    kilde !== Kildetype.Saksbehandler &&
    kilde !== Inntektskilde.Saksbehandler &&
    kilde !== Inntektskilde.SkjonnsmessigFastsatt;

export const Kilde = ({ type, children, className }: KildeProps) => {
    return (
        <Tooltip content={getKildeTypeTooltip(type)}>
            <Kildeikon className={className} type={type}>
                {erTekst(type) ? <div className="Tekst">{children}</div> : children}
            </Kildeikon>
        </Tooltip>
    );
};
