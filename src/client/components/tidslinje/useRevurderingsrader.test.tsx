import { Periode, PerioderBuilder, PerioderTilstand } from './useRevurderingsrader';
import dayjs from 'dayjs';
import { Dagtype } from 'internal-types';

describe('useRevurderingsrader', () => {
    test('kan utvide periode', () => {
        const periode = new Periode(dayjs('2018-01-01').toDate());
        periode.extend(dayjs('2018-01-31').toDate());
        expect(periode.tom).toEqual(dayjs('2018-01-31').toDate());
    });

    test('builder add legger til periode i perioder-objektet', () => {
        const builder = new PerioderBuilder();
        builder.add(new Periode(dayjs('2018-01-01').toDate()));
        expect(builder.perioder.length).toEqual(1);
    });

    test('er til revurdering når perioden inneholder én dag', () => {
        const periode = new Periode(dayjs('2018-01-01').toDate());
        expect(periode.erTilRevurdering(dayjs('2018-01-01').toDate())).toBeTruthy();
    });

    test('er til revurdering når dagen ligger innenfor perioden', () => {
        const periode = new Periode(dayjs('2018-01-01').toDate());
        periode.extend(dayjs('2018-01-03').toDate());
        expect(periode.erTilRevurdering(dayjs('2018-01-02').toDate())).toBeTruthy();
    });

    test('er ikke til revurdering når dagen ligger etter perioden', () => {
        const periode = new Periode(dayjs('2018-01-01').toDate());
        periode.extend(dayjs('2018-01-02').toDate());
        expect(periode.erTilRevurdering(dayjs('2018-01-03').toDate())).toBeFalsy();
    });

    test('er til revurdering når dagen ligger før perioden', () => {
        const periode = new Periode(dayjs('2018-01-02').toDate());
        expect(periode.erTilRevurdering(dayjs('2018-01-01').toDate())).toBeTruthy();
    });

    test('Kan bytte tilstand', () => {
        const builder = new PerioderBuilder();
        builder.byttTilstand(new TestState(), dayjs('2018-01-01').toDate());
        expect(builder.tilstand).toBeInstanceOf(TestState);
    });

    test('Tom tidslinje', () => {
        const tidslinje = {
            beregnettidslinje: [],
            hendelsetidslinje: [],
            utbetalinger: [],
        };

        const builder = new PerioderBuilder();
        builder.build(tidslinje);
        expect(builder.perioder.length).toEqual(0);
    });

    test('Kan konvertere sykedag til periode', () => {
        const tidslinje = {
            beregnettidslinje: [
                {
                    dato: dayjs('2018-01-01'),
                    type: Dagtype.Syk,
                },
            ],
            hendelsetidslinje: [],
            utbetalinger: [],
        };

        const builder = new PerioderBuilder();
        builder.build(tidslinje);
        expect(builder.perioder.length).toEqual(1);
    });

    test('Konverterer ikke ubestemt dag til periode', () => {
        const tidslinje = {
            beregnettidslinje: [
                {
                    dato: dayjs('2018-01-01'),
                    type: Dagtype.Syk,
                },
                {
                    dato: dayjs('2018-01-02'),
                    type: Dagtype.Ubestemt,
                },
            ],
            hendelsetidslinje: [],
            utbetalinger: [],
        };

        const builder = new PerioderBuilder();
        builder.build(tidslinje);
        expect(builder.perioder.length).toEqual(1);
    });

    test('Sykedag på hver side av en ubestemt dag medfører to perioder', () => {
        const tidslinje = {
            beregnettidslinje: [
                {
                    dato: dayjs('2018-01-01'),
                    type: Dagtype.Syk,
                },
                {
                    dato: dayjs('2018-01-02'),
                    type: Dagtype.Ubestemt,
                },
                {
                    dato: dayjs('2018-01-03'),
                    type: Dagtype.Syk,
                },
            ],
            hendelsetidslinje: [],
            utbetalinger: [],
        };

        const builder = new PerioderBuilder();
        builder.build(tidslinje);
        expect(builder.perioder.length).toEqual(2);
    });

    test('Ikke ny periode ved ukjent dagtype', () => {
        const tidslinje = {
            beregnettidslinje: [
                {
                    dato: dayjs('2018-01-01'),
                    type: Dagtype.Syk,
                },
                {
                    dato: dayjs('2018-01-02'),
                    type: Dagtype.Ubestemt,
                },
                {
                    dato: dayjs('2018-01-03'),
                    type: Dagtype.Annullert,
                },
                {
                    dato: dayjs('2018-01-04'),
                    type: Dagtype.Syk,
                },
            ],
            hendelsetidslinje: [],
            utbetalinger: [],
        };

        const builder = new PerioderBuilder();
        builder.build(tidslinje);
        expect(builder.perioder.length).toEqual(2);
    });
});

class TestState implements PerioderTilstand {
    entering = (builder: PerioderBuilder, dagen: Date) => {};
    leaving = (builder: PerioderBuilder, dagen: Date) => {};
    sykedag = (builder: PerioderBuilder, dagen: Date) => {};
    ukjentDag = (builder: PerioderBuilder, dagen: Date) => {};
}
