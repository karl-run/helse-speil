import dayjs from 'dayjs';
import { atom, AtomEffect, useRecoilValueLoadable, useResetRecoilState, useSetRecoilState } from 'recoil';

import { getNotater } from '@io/http';
import { Notat as GraphQLNotat } from '@io/graphql';
import { useEffect } from 'react';

const vedtaksperiodeIderState = atom<string[]>({
    key: 'vedtaksperiodeIderState',
    default: [],
});

export const useSyncNotater = (vedtaksperiodeIder: string[]) => {
    const setNotatVedtaksperioder = useSetRecoilState(vedtaksperiodeIderState);

    useEffect(() => {
        setNotatVedtaksperioder(vedtaksperiodeIder);
    }, [JSON.stringify(vedtaksperiodeIder)]);
};

const initializeNotaterEffect: AtomEffect<Array<Notat>> = ({ getPromise }) => {
    getPromise(vedtaksperiodeIderState).then((ider) => {
        if (ider.length < 1) {
            return Promise.resolve([]);
        }
        return getNotater(ider).then((res) => {
            return Object.values(res)
                .flat()
                .map(toNotat)
                .sort((a, b) => (a.opprettet < b.opprettet ? 1 : -1));
        });
    });
};

const notaterState = atom<Array<Notat>>({
    key: 'notaterState',
    default: [],
    effects: [initializeNotaterEffect],
});

export const useRefreshNotater = () => {
    return useResetRecoilState(notaterState);
};

export const useNotaterForVedtaksperiode = (vedtaksperiodeId?: string) => {
    const notater = useRecoilValueLoadable<Notat[]>(notaterState);
    return notater.state === 'hasValue'
        ? notater.contents.filter((notat) => notat.vedtaksperiodeId == vedtaksperiodeId)
        : [];
};

export const toNotat = (spesialistNotat: ExternalNotat | GraphQLNotat): Notat => ({
    id: `${spesialistNotat.id}`,
    tekst: spesialistNotat.tekst,
    saksbehandler: {
        navn: spesialistNotat.saksbehandlerNavn,
        oid: spesialistNotat.saksbehandlerOid,
        epost: spesialistNotat.saksbehandlerEpost,
        ident: spesialistNotat.saksbehandlerIdent,
    },
    opprettet: dayjs(spesialistNotat.opprettet),
    vedtaksperiodeId: spesialistNotat.vedtaksperiodeId,
    feilregistrert: spesialistNotat.feilregistrert,
    type: spesialistNotat.type,
});
