import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Bag } from '@navikt/ds-icons';
import { Accordion, BodyShort, Tooltip } from '@navikt/ds-react';

import { Flex } from '@components/Flex';
import { LoadingShimmer } from '@components/LoadingShimmer';
import { AnonymizableTextWithEllipsis } from '@components/TextWithEllipsis';
import { AnonymizableContainer } from '@components/anonymizable/AnonymizableContainer';
import { AnonymizableText } from '@components/anonymizable/AnonymizableText';
import { Clipboard } from '@components/clipboard';
import { Arbeidsforhold } from '@io/graphql';
import { NORSK_DATOFORMAT } from '@utils/date';
import { capitalize, somPenger } from '@utils/locale';

import styles from './ArbeidsgiverRow.module.css';

interface OrganisasjonsnummerRowProps {
    organisasjonsnummer: string;
}

const OrganisasjonsnummerRow: React.VFC<OrganisasjonsnummerRowProps> = ({ organisasjonsnummer }) => {
    return (
        <Clipboard
            preserveWhitespace={false}
            copyMessage="Organisasjonsnummer er kopiert"
            tooltip={{ content: 'Kopier organisasjonsnummer' }}
        >
            <AnonymizableText>{organisasjonsnummer}</AnonymizableText>
        </Clipboard>
    );
};

interface ArbeidsforholdRowProps {
    arbeidsforhold: Array<Arbeidsforhold>;
}

const ArbeidsforholdRow: React.VFC<ArbeidsforholdRowProps> = ({ arbeidsforhold }) => {
    return (
        <>
            {arbeidsforhold.map((arbeidsforhold, i) => {
                const stillingstittel = capitalize(arbeidsforhold.stillingstittel);
                const fom = dayjs(arbeidsforhold.startdato).format(NORSK_DATOFORMAT);
                const tom = arbeidsforhold.sluttdato && dayjs(arbeidsforhold.sluttdato).format(NORSK_DATOFORMAT);

                return (
                    <React.Fragment key={i}>
                        <Tooltip content={`${stillingstittel}, ${arbeidsforhold.stillingsprosent} %`}>
                            <div className={styles.Arbeidsforhold}>
                                <AnonymizableTextWithEllipsis>
                                    {`${capitalize(stillingstittel)}`}
                                </AnonymizableTextWithEllipsis>
                                <AnonymizableText>{`, ${arbeidsforhold.stillingsprosent} %`}</AnonymizableText>
                            </div>
                        </Tooltip>
                        <BodyShort>
                            {fom}
                            {tom && ' - ' && tom}
                        </BodyShort>
                    </React.Fragment>
                );
            })}
        </>
    );
};

interface MånedsbeløpRowProps {
    månedsbeløp: number;
}

const MånedsbeløpRow: React.VFC<MånedsbeløpRowProps> = ({ månedsbeløp }) => {
    return (
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <BodyShort>Månedsbeløp:</BodyShort>
            {somPenger(månedsbeløp)}
        </Flex>
    );
};

interface ArbeidsgiverCardProps {
    navn: string;
    organisasjonsnummer: string;
    arbeidsforhold: Array<Arbeidsforhold>;
    månedsbeløp?: number;
}

const ArbeidsgiverRowView: React.FC<ArbeidsgiverCardProps> = ({
    navn,
    organisasjonsnummer,
    arbeidsforhold,
    månedsbeløp,
}) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Tooltip content="Arbeidsgiver">
                <div className={styles.IconContainer}>
                    <Bag tabIndex={-1} title="Arbeidsgiver" />
                </div>
            </Tooltip>
            <Accordion.Item open={open} className={styles.ArbeidsgiverRow}>
                <Accordion.Header className={styles.Header} onClick={() => setOpen((prevState) => !prevState)}>
                    <AnonymizableContainer>
                        <BodyShort className={styles.NoWrap}>
                            {navn.charAt(0).toUpperCase() + navn.slice(1).toLowerCase()}
                        </BodyShort>
                    </AnonymizableContainer>
                </Accordion.Header>
                <Accordion.Content className={styles.Content}>
                    <OrganisasjonsnummerRow organisasjonsnummer={organisasjonsnummer} />
                    <ArbeidsforholdRow arbeidsforhold={arbeidsforhold} />
                </Accordion.Content>
                {månedsbeløp && <MånedsbeløpRow månedsbeløp={månedsbeløp} />}
            </Accordion.Item>
        </>
    );
};

const ArbeidsgiverCardSkeleton: React.FC = () => {
    return (
        <section className={classNames(styles.Skeleton, styles.ArbeidsgiverRow)}>
            <Flex gap="12px">
                <LoadingShimmer style={{ width: 20 }} />
                <LoadingShimmer />
            </Flex>
            <LoadingShimmer />
            <LoadingShimmer />
            <LoadingShimmer />
            <LoadingShimmer />
        </section>
    );
};

export const ArbeidsgiverRow = {
    Beregnet: ArbeidsgiverRowView,
    Uberegnet: ArbeidsgiverRowView,
    Ghost: ArbeidsgiverRowView,
    Skeleton: ArbeidsgiverCardSkeleton,
};
