import { personState, useHentPerson, useRefreshPerson } from '../state/person';
import { useRecoilValue } from 'recoil';
import { nyeOpptegnelserState } from '../state/opptegnelser';
import { OpptegnelseDTO } from 'external-types';

const personHarFåttOpptegnelse = (opptegnelser: OpptegnelseDTO[], valgtAktørId: string) => {
    return opptegnelser.filter((opptegnelse) => opptegnelse.aktørId.toString() === valgtAktørId);
};

export const useRefreshPersonVedAnnullering = () => {
    const opptegnelser = useRecoilValue(nyeOpptegnelserState);
    const valgtAktør = useRecoilValue(personState);
    const aktørId = valgtAktør?.person?.aktørId;
    const refreshPerson = useRefreshPerson();
    if (aktørId === undefined) return;
    else if (personHarFåttOpptegnelse(opptegnelser, aktørId)) refreshPerson();
};
