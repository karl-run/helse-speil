import React, { FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search } from '@navikt/ds-react';

import { useLazyQuery } from '@apollo/client';
import styles from '@components/header/Header.module.css';
import { useLoadingToast } from '@hooks/useLoadingToast';
import { erGyldigPersonId } from '@hooks/useRefreshPersonVedUrlEndring';
import { FetchPersonDocument } from '@io/graphql';
import { validFødselsnummer } from '@io/graphql/common';
import { NotFoundError } from '@io/graphql/errors';
import { useAddVarsel, useRapporterGraphQLErrors, useRemoveVarsel } from '@state/varsler';
import { SpeilError } from '@utils/error';

export const Personsøk: React.FC = () => {
    const removeVarsel = useRemoveVarsel();
    const addVarsel = useAddVarsel();
    const navigate = useNavigate();
    const rapporterError = useRapporterGraphQLErrors();
    const [hentPerson, { loading }] = useLazyQuery(FetchPersonDocument, {
        onError: (error) => {
            rapporterError(error.graphQLErrors);
        },
    });

    useLoadingToast({ isLoading: loading, message: 'Henter person' });

    const searchRef = useRef<HTMLInputElement>(null);

    const søkOppPerson = async (event: FormEvent) => {
        event.preventDefault();
        removeVarsel('ugyldig-søk');
        const personId = searchRef.current?.value;

        if (!personId || loading) {
            return;
        }

        if (!erGyldigPersonId(personId)) {
            addVarsel(new SpeilError(`"${personId}" er ikke en gyldig aktør-ID/fødselsnummer.`));
        } else {
            const variables: { aktorId?: string; fnr?: string } = validFødselsnummer(personId)
                ? { fnr: personId }
                : { aktorId: personId };
            hentPerson({
                variables: variables,
            }).then(({ data }) => {
                if (data?.person?.arbeidsgivere.length === 0) {
                    addVarsel(new NotFoundError());
                    return;
                }
                if (data?.person) {
                    navigate(`/person/${data.person.aktorId}/utbetaling`);
                }
            });
        }
    };

    return (
        <form className={styles.SearchForm} onSubmit={søkOppPerson}>
            <Search label="Søk" size="small" variant="secondary" placeholder="Søk" ref={searchRef} />
        </form>
    );
};
