import { RecoilAndRouterWrapper } from '@test-wrappers';
import { axe } from 'jest-axe';
import React from 'react';

import { useMineOppgaver, useOppgaver, useQueryOppgaver } from '@state/oppgaver';
import { useResetPerson } from '@state/person';
import { enOppgaveForOversikten } from '@test-data/oppgave';
import { render } from '@testing-library/react';

import { Oversikt } from './Oversikt';

jest.mock('@state/oppgaver');
jest.mock('@state/person');

describe('Oversikt', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('rendrer uten violations', async () => {
        const oppgaver = [enOppgaveForOversikten()];

        (useMineOppgaver as jest.Mock).mockReturnValue([]);
        (useOppgaver as jest.Mock).mockReturnValue(oppgaver);
        (useQueryOppgaver as jest.Mock).mockReturnValue({
            oppgaver: oppgaver,
            errors: undefined,
            loading: false,
        });

        const { container } = render(<Oversikt />, { wrapper: RecoilAndRouterWrapper });

        const result = await axe(container);

        expect(result).toHaveNoViolations();
        expect(useResetPerson).toHaveBeenCalled();
    });
});

// Testen oversteg default setting på 5000 ved kjøring lokalt
jest.setTimeout(10000);
