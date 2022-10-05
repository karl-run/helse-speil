import { extractGroups, extractIdent } from '@utils/cookie';

const groupIdForTbd = 'f787f900-6697-440d-a086-d5bb56e26a9c';
const groupIdForBesluttere = '59f26eef-0a4f-4038-bf46-3a5b2f252155';

const eminem = 'G103083';
const supersaksbehandlere = [eminem, 'A148751', 'N115007', 'C117102'];

const fagkoordinatorer = ['M136300', 'S108267'];

const enhetsledere = ['B138607'];

const coaches = ['J153777', 'F131883', 'K104953', 'S109031', 'V149621', 'S160466', 'O123659', 'A160730'];

const tilgangStikkprøver = ['F140836', 'S109031', 'O123659', 'S160466', 'K104953', 'J153777', 'V149621'];

const kunLesetilgang: string[] = [];

export const erLocal = () => location.hostname === 'localhost';
export const erDev = () => location.hostname === 'speil.dev.intern.nav.no';

const harKunLesetilgang = () => kunLesetilgang.includes(extractIdent());
const harTilgangTilAlt = () => [...supersaksbehandlere, ...fagkoordinatorer, ...enhetsledere].includes(extractIdent());
const erCoach = () => coaches.includes(extractIdent());
const harTilgangStikkprøver = () => tilgangStikkprøver.includes(extractIdent());

const erPåTeamBømlo = () => extractGroups().includes(groupIdForTbd);

export const overstyreUtbetaltPeriodeEnabled = !harKunLesetilgang();
export const annulleringerEnabled = !harKunLesetilgang();
export const utbetalingsoversikt = !harKunLesetilgang();

export const overstyrPermisjonsdagerEnabled = true;
export const stikkprøve = harTilgangStikkprøver() || harTilgangTilAlt() || erLocal() || erDev();
export const flereArbeidsgivere = true;

export const utbetalingTilSykmeldt = erLocal() || erDev() || erPåTeamBømlo() || harTilgangTilAlt() || erCoach();

export const kanFrigiAndresOppgaver = harTilgangTilAlt() || erLocal() || erDev();

export const graphqlplayground = erLocal() || erDev() || erPåTeamBømlo();

export interface UtbetalingToggles {
    overstyreUtbetaltPeriodeEnabled: boolean;
}

export const defaultUtbetalingToggles: UtbetalingToggles = {
    overstyreUtbetaltPeriodeEnabled: overstyreUtbetaltPeriodeEnabled,
};

export const overstyrInntektEnabled = overstyreUtbetaltPeriodeEnabled;

export const harBeslutterrolle: boolean = extractGroups().includes(groupIdForBesluttere);

export const toggleMeny: boolean = erLocal() || erDev();

const saksbehandlereMedNyPølsevisning = [
    'N115007',
    'A160730',
    'O123659',
    'S160466',
    'R154509',
    'S109031',
    'F131883',
    'A158665',
    'G103083',
];

export const pølsebonansaEnabled = erDev() || erLocal() || saksbehandlereMedNyPølsevisning.includes(extractIdent());
