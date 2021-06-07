import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { SpesialistArbeidsgiver, SpleisUtbetalingsdagtype } from 'external-types';
import { Dagtype, Vedtaksperiode } from 'internal-types';
import React from 'react';
import { mappetPerson } from 'test-data';

import { VedtaksperiodeBuilder } from '../../../mapping/vedtaksperiode';

import { umappetArbeidsgiver } from '../../../../test/data/arbeidsgiver';
import {
    mappetVedtaksperiode,
    medUtbetalingstidslinje,
    umappetVedtaksperiode,
} from '../../../../test/data/vedtaksperiode';
import {
    periodeDagerIgjen,
    totaltAntallUtbetalingsdager,
    totalUtbetaling,
    Utbetalingsoversikt,
} from './Utbetalingsoversikt';

const enIkkeUtbetaltVedtaksperiode = async () => {
    const { vedtaksperiode } = new VedtaksperiodeBuilder()
        .setVedtaksperiode(umappetVedtaksperiode())
        .setArbeidsgiver({ organisasjonsnummer: '123456789' } as SpesialistArbeidsgiver)
        .setAnnullertUtbetalingshistorikk([])
        .setOverstyringer([])
        .build();
    return vedtaksperiode as Vedtaksperiode;
};

describe('Utbetalingsoversikt', () => {
    test('Totalutbetaling blir 0 med tom utbetalingstidslinje', () => {
        const utbetaling = totalUtbetaling([]);
        expect(utbetaling).toBe(0);
    });

    test('Totalutbetaling regner ut riktig beløp', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        const utbetaling = totalUtbetaling(vedtaksperiode.utbetalingstidslinje);
        expect(utbetaling).toBe(34500);
    });

    test('Totalutbetaling regner ut riktig beløp ved en avvist dagtype', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        vedtaksperiode.utbetalingstidslinje[0].type = Dagtype.Avvist;
        const utbetaling = totalUtbetaling(vedtaksperiode.utbetalingstidslinje);
        expect(utbetaling).toBe(33000);
    });

    test('Totalutbetalingsdager blir 0 med tom utbetalingstidslinje', () => {
        const utbetalingsdager = totaltAntallUtbetalingsdager([]);
        expect(utbetalingsdager).toBe(0);
    });

    test('Totalutbetalingsdager regner ut riktig antall dager', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        const utbetalingsdager = totaltAntallUtbetalingsdager(vedtaksperiode.utbetalingstidslinje);
        expect(utbetalingsdager).toBe(23);
    });

    test('Totalutbetalingsdager regner ut riktig antall dager ved en avvist dag', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        vedtaksperiode.utbetalingstidslinje[0].type = Dagtype.Avvist;
        const utbetalingsdager = totaltAntallUtbetalingsdager(vedtaksperiode.utbetalingstidslinje);
        expect(utbetalingsdager).toBe(22);
    });

    test('Dager igjen per dato i en periode er en tom liste dersom vi mangler data', () => {
        const dagerIgjen = periodeDagerIgjen(undefined, undefined, []);
        expect(dagerIgjen).toStrictEqual([]);
    });

    test('Dager igjen per dato i en periode regnes riktig dersom maksdato har vært og gjenstående dager er 0', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        vedtaksperiode.vilkår!!.dagerIgjen.gjenståendeDager = 0;
        vedtaksperiode.vilkår!!.dagerIgjen.maksdato = dayjs('2019-12-31');
        const dagerIgjen = periodeDagerIgjen(
            vedtaksperiode.vilkår?.dagerIgjen.maksdato,
            vedtaksperiode.vilkår?.dagerIgjen.gjenståendeDager,
            vedtaksperiode.utbetalingstidslinje
        );
        expect(dagerIgjen[0]).toBe(0);
        expect(dagerIgjen[30]).toBe(0);
    });

    test('Dager igjen per dato i en periode regnes ut riktig', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        vedtaksperiode.vilkår!!.dagerIgjen.gjenståendeDager = 50;
        const dagerIgjen = periodeDagerIgjen(
            vedtaksperiode.vilkår?.dagerIgjen.maksdato,
            vedtaksperiode.vilkår?.dagerIgjen.gjenståendeDager,
            vedtaksperiode.utbetalingstidslinje
        );
        expect(dagerIgjen[0]).toBe(72);
        expect(dagerIgjen[1]).toBe(71);
        expect(dagerIgjen[30]).toBe(50);
        expect(dagerIgjen[30]).toBe(vedtaksperiode.vilkår?.dagerIgjen.gjenståendeDager);
    });

    test('Dager igjen per dato i en periode regnes ut riktig for en periode med en avvist dag', async () => {
        const vedtaksperiode = await enIkkeUtbetaltVedtaksperiode();
        vedtaksperiode.vilkår!!.dagerIgjen.gjenståendeDager = 50;
        vedtaksperiode.utbetalingstidslinje[1].type = Dagtype.Avvist;
        const dagerIgjen = periodeDagerIgjen(
            vedtaksperiode.vilkår?.dagerIgjen.maksdato,
            vedtaksperiode.vilkår?.dagerIgjen.gjenståendeDager,
            vedtaksperiode.utbetalingstidslinje
        );
        expect(dagerIgjen[0]).toBe(71);
        expect(dagerIgjen[1]).toBe(71);
        expect(dagerIgjen[30]).toBe(50);
    });

    it('Alle dager er godkjent', async () => {
        const vedtaksperiode = mappetVedtaksperiode();
        const periode = { fom: vedtaksperiode.fom, tom: vedtaksperiode.tom };
        const utbetalingstidslinje = vedtaksperiode.utbetalingstidslinje;
        const sykdomstidslinje = vedtaksperiode.sykdomstidslinje;
        const { maksdato, gjenståendeDager } = vedtaksperiode.vilkår!!.dagerIgjen;
        render(
            <Utbetalingsoversikt
                utbetalingstidslinje={utbetalingstidslinje}
                sykdomstidslinje={sykdomstidslinje}
                maksdato={maksdato}
                gjenståendeDager={gjenståendeDager}
                periode={periode}
            />
        );

        expect(screen.queryAllByText('Ingen utbetaling')).toStrictEqual([]);
        expect(screen.queryAllByText('100 %').length).toBe(23);
    });

    it('Alle kolonnene i tabellen er til stede', async () => {
        const vedtaksperiode = mappetVedtaksperiode();
        const periode = { fom: vedtaksperiode.fom, tom: vedtaksperiode.tom };
        const utbetalingstidslinje = vedtaksperiode.utbetalingstidslinje;
        const sykdomstidslinje = vedtaksperiode.sykdomstidslinje;
        const { maksdato, gjenståendeDager } = vedtaksperiode.vilkår!!.dagerIgjen;

        render(
            <Utbetalingsoversikt {...{ utbetalingstidslinje, sykdomstidslinje, maksdato, gjenståendeDager, periode }} />
        );
        expect(screen.queryByText('Dato')).toBeVisible();
        expect(screen.queryByText('Utbet. dager')).toBeVisible();
        expect(screen.queryByText('Grad')).toBeVisible();
        expect(screen.queryByText('Total grad')).toBeVisible();
        expect(screen.queryByText('Utbetaling')).toBeVisible();
        expect(screen.queryByText('Dager igjen')).toBeVisible();
    });

    it('2 dager er avvist', async () => {
        const vedtaksperiode = mappetPerson([
            umappetArbeidsgiver([
                medUtbetalingstidslinje(umappetVedtaksperiode(), [
                    {
                        type: SpleisUtbetalingsdagtype.NAVDAG,
                        inntekt: 999.5,
                        dato: '2020-01-01',
                        utbetaling: 1000.0,
                        grad: 100,
                    },
                    {
                        type: SpleisUtbetalingsdagtype.AVVISTDAG,
                        inntekt: 999.5,
                        dato: '2020-01-02',
                        utbetaling: 0.0,
                        begrunnelser: ['MinimumSykdomsgrad'],
                        grad: 0,
                    },
                    {
                        type: SpleisUtbetalingsdagtype.AVVISTDAG,
                        inntekt: 999.5,
                        dato: '2020-01-03',
                        utbetaling: 0.0,
                        begrunnelser: ['EtterDødsdato'],
                        grad: 0,
                    },
                ]),
            ]),
        ]).arbeidsgivere[0].vedtaksperioder[0] as Vedtaksperiode;

        const periode = { fom: vedtaksperiode.fom, tom: vedtaksperiode.tom };
        const utbetalingstidslinje = vedtaksperiode.utbetalingstidslinje;
        const sykdomstidslinje = vedtaksperiode.sykdomstidslinje;
        const { maksdato, gjenståendeDager } = vedtaksperiode.vilkår!!.dagerIgjen;

        render(
            <Utbetalingsoversikt
                {...{
                    sykdomstidslinje,
                    utbetalingstidslinje,
                    maksdato,
                    gjenståendeDager,
                    periode,
                }}
            />
        );

        expect(screen.queryAllByText('-').length).toStrictEqual(2);
        expect(screen.queryAllByText('Personen er død').length).toStrictEqual(1);
        expect(screen.queryAllByText('8-13', { exact: false }).length).toStrictEqual(1);
        expect(screen.queryAllByText('100 %').length).toStrictEqual(1);
        expect(screen.queryAllByText('0 %').length).toStrictEqual(2);
    });
});
