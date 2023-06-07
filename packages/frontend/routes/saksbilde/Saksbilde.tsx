import { VenterPåEndringProvider } from './VenterPåEndringContext';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Alert } from '@navikt/ds-react';

import { ErrorBoundary } from '@components/ErrorBoundary';
import { useRefreshPersonVedOpptegnelse } from '@hooks/useRefreshPersonVedOpptegnelse';
import { useRefreshPersonVedUrlEndring } from '@hooks/useRefreshPersonVedUrlEndring';
import { useVarselOmSakErTildeltAnnenSaksbehandler } from '@hooks/useVarselOmSakErTildeltAnnenSaksbehandler';
import { AmplitudeProvider } from '@io/amplitude';
import { usePollEtterOpptegnelser } from '@io/http';

import { PersonHeader } from './personHeader';
import { SaksbildeMenu } from './saksbildeMenu/SaksbildeMenu';
import { PeriodeView } from './saksbilder/PeriodeView';
import { Timeline } from './timeline';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

import styles from './Saksbilde.module.css';

// @ts-ignore
const Utbetalingshistorikk = React.lazy(() => import('./utbetalingshistorikk/Utbetalingshistorikk'));

const SaksbildeContent = React.memo(() => {
    useRefreshPersonVedUrlEndring();
    useRefreshPersonVedOpptegnelse();
    usePollEtterOpptegnelser();
    useVarselOmSakErTildeltAnnenSaksbehandler();
    useKeyboardShortcuts();

    return (
        <div className={styles.Saksbilde}>
            <PersonHeader />
            <Timeline />
            <AmplitudeProvider>
                <VenterPåEndringProvider>
                    <SaksbildeMenu />
                    <Routes>
                        <Route path="utbetalingshistorikk" element={<Utbetalingshistorikk />} />
                        <Route path="/*" element={<PeriodeView />} />
                    </Routes>
                </VenterPåEndringProvider>
            </AmplitudeProvider>
        </div>
    );
});

export const Saksbilde = () => (
    <ErrorBoundary
        fallback={(error: Error) => (
            <Alert variant="warning" size="small" className={styles.Alert}>
                {error.message}
            </Alert>
        )}
    >
        <SaksbildeContent />
    </ErrorBoundary>
);
