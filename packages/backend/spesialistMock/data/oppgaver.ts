import {
    Adressebeskyttelse,
    Kjonn,
    Mottaker,
    OppgaveForOversiktsvisning,
    Oppgavetype,
    Periodetype,
} from '../schemaTypes';

export const oppgaver: Array<OppgaveForOversiktsvisning> = [
    {
        id: '4680',
        type: Oppgavetype.Soknad,
        opprettet: '2022-11-02T11:09:57',
        opprinneligSoknadsdato: '2022-04-21 09:48:33.10625',
        vedtaksperiodeId: 'd7d208c3-a9a1-4c03-885f-aeffa4475a49',
        personinfo: {
            fornavn: 'SLAPP',
            mellomnavn: null,
            etternavn: 'APPELSIN',
            fodselsdato: '1986-02-06',
            kjonn: Kjonn.Kvinne,
            adressebeskyttelse: Adressebeskyttelse.Ugradert,
        },
        navn: {
            fornavn: 'SLAPP',
            mellomnavn: null,
            etternavn: 'APPELSIN',
        },
        fodselsnummer: '06028620819',
        aktorId: '2564094783926',
        antallVarsler: 3,
        periodetype: Periodetype.Forstegangsbehandling,
        flereArbeidsgivere: false,
        boenhet: {
            id: '1401',
            navn: 'Flora',
        },
        tildeling: {
            navn: 'Øydis',
            oid: 'ting',
            reservert: true,
            epost: 'frosk@frog.no',
        },
        mottaker: Mottaker.Arbeidsgiver,
    },
    {
        id: '4959',
        type: Oppgavetype.Soknad,
        opprettet: '2023-01-02T11:09:57',
        opprinneligSoknadsdato: '2022-12-30 12:27:29.585667',
        vedtaksperiodeId: 'beab6f33-b26b-44e1-9098-52019181c720',
        personinfo: {
            fornavn: 'BAMES',
            mellomnavn: null,
            etternavn: 'JOND',
            fodselsdato: '1991-01-17',
            kjonn: Kjonn.Mann,
            adressebeskyttelse: Adressebeskyttelse.Ugradert,
        },
        navn: {
            fornavn: 'BAMES',
            mellomnavn: null,
            etternavn: 'JOND',
        },
        fodselsnummer: '57419121128',
        aktorId: '2348185725298',
        antallVarsler: 0,
        periodetype: Periodetype.Forstegangsbehandling,
        flereArbeidsgivere: false,
        boenhet: {
            id: '0393',
            navn: 'NAV oppfølging utland',
        },
        tildeling: {
            navn: 'Frosk',
            oid: 'ting',
            reservert: true,
            epost: 'frosk@frog.no',
        },
        mottaker: Mottaker.Arbeidsgiver,
    },
    {
        id: '4917',
        type: Oppgavetype.Soknad,
        opprettet: '2023-01-02T11:09:57',
        opprinneligSoknadsdato: '2022-12-30 12:27:29.585667',
        vedtaksperiodeId: 'beab6f33-b26b-44e1-9098-52019181c720',
        personinfo: {
            fornavn: 'OPTIMISTISK',
            mellomnavn: null,
            etternavn: 'BANAN',
            fodselsdato: '1991-01-17',
            kjonn: Kjonn.Mann,
            adressebeskyttelse: Adressebeskyttelse.Ugradert,
        },
        navn: {
            fornavn: 'OPTIMISTISK',
            mellomnavn: null,
            etternavn: 'BANAN',
        },
        fodselsnummer: '12345678910',
        aktorId: '1000001337420',
        antallVarsler: 0,
        periodetype: Periodetype.Forstegangsbehandling,
        flereArbeidsgivere: false,
        boenhet: {
            id: '0393',
            navn: 'NAV oppfølging utland',
        },
        tildeling: {
            navn: 'Pølse',
            oid: 'ting',
            reservert: true,
            epost: 'frosk@frog.no',
        },
        mottaker: null,
    },
    {
        id: '5917',
        type: Oppgavetype.Soknad,
        opprettet: '2023-01-02T11:09:57',
        opprinneligSoknadsdato: '2022-12-30 12:27:29.585667',
        vedtaksperiodeId: 'beab6f33-b26b-44e1-9098-52019181c719',
        personinfo: {
            fornavn: 'OPTIMISTISK',
            mellomnavn: null,
            etternavn: 'BANAN',
            fodselsdato: '1991-01-17',
            kjonn: Kjonn.Mann,
            adressebeskyttelse: Adressebeskyttelse.Ugradert,
        },
        navn: {
            fornavn: 'OPTIMISTISK',
            mellomnavn: null,
            etternavn: 'BANAN',
        },
        fodselsnummer: '12345678911',
        aktorId: '1000001337421',
        antallVarsler: 0,
        periodetype: Periodetype.Forstegangsbehandling,
        flereArbeidsgivere: false,
        boenhet: {
            id: '0393',
            navn: 'NAV oppfølging utland',
        },
        tildeling: null,
        mottaker: Mottaker.Arbeidsgiver,
    },
];
