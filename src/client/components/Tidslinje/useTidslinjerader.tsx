import { Person, Vedtaksperiode } from '../../context/types.internal';
import {
    EnkelSykepengetidslinje,
    Sykepengeperiode
} from '@navikt/helse-frontend-tidslinje/dist/components/sykepengetidslinje/Sykepengetidslinje';
import React, { useMemo } from 'react';

export const toSykepengeperiode = (vedtaksperiode: Vedtaksperiode): Sykepengeperiode => ({
    id: vedtaksperiode.id,
    fom: vedtaksperiode.fom.toDate(),
    tom: vedtaksperiode.tom.toDate(),
    status: vedtaksperiode.tilstand,
    disabled: !vedtaksperiode.kanVelges
});

export const useTidslinjerader = (person?: Person): EnkelSykepengetidslinje[] =>
    useMemo(
        () =>
            person?.arbeidsgivere.map(arbeidsgiver => {
                return {
                    perioder: arbeidsgiver.vedtaksperioder.map(toSykepengeperiode)
                };
            }) ?? [],
        [person]
    );
