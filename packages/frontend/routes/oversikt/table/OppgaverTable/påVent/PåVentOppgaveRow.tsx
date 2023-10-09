import React from 'react';

import { Table } from '@navikt/ds-react';

import { OppgaveTilBehandling, Periodetype } from '@io/graphql';

import { LinkRow } from '../../LinkRow';
import { DatoCell } from '../../cells/DatoCell';
import { EgenskaperCell } from '../../cells/EgenskaperCell';
import { InntektskildeCell } from '../../cells/InntektskildeCell';
import { MottakerCell } from '../../cells/MottakerCell';
import { OppgavetypeCell } from '../../cells/OppgavetypeCell';
import { PeriodetypeCell } from '../../cells/PeriodetypeCell';
import { SøkerCell } from '../../cells/SøkerCell';
import { NotatCell } from '../../cells/notat/NotatCell';
import { OptionsCell } from '../../cells/options/OptionsCell';

interface PåVentOppgaveRowProps {
    oppgave: OppgaveTilBehandling;
}

export const PåVentOppgaveRow = ({ oppgave }: PåVentOppgaveRowProps) => (
    <LinkRow aktørId={oppgave.aktorId}>
        <PeriodetypeCell periodetype={oppgave.periodetype ?? Periodetype.Forstegangsbehandling} />
        <OppgavetypeCell oppgavetype={oppgave.oppgavetype} />
        <MottakerCell mottaker={oppgave.mottaker} />
        <EgenskaperCell egenskaper={oppgave.egenskaper} />
        <InntektskildeCell antallArbeidsforhold={oppgave.antallArbeidsforhold} />
        <SøkerCell name={oppgave.navn} />
        <DatoCell date={oppgave.opprettet} />
        <DatoCell date={oppgave.opprinneligSoknadsdato ?? oppgave.opprettet} />
        <OptionsCell oppgave={oppgave} navn={oppgave.navn} />
        {oppgave.tildeling?.paaVent ? (
            <NotatCell
                vedtaksperiodeId={oppgave.vedtaksperiodeId}
                navn={oppgave.navn}
                erPåVent={oppgave.tildeling.paaVent}
            />
        ) : (
            <Table.DataCell />
        )}
    </LinkRow>
);
