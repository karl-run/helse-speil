import dayjs from 'dayjs';
import { GraphQLError } from 'graphql';

import {
    MutationSettStatusAktivArgs,
    MutationSettStatusVurdertArgs,
    MutationSettVarselstatusAktivArgs,
    MutationSettVarselstatusVurdertArgs,
    VarselDto,
    Varselstatus,
} from '../schemaTypes';

const ISO_TIDSPUNKTFORMAT = 'YYYY-MM-DDTHH:mm:ss';

export class VarselMock {
    private static varslerMedEndring: Array<VarselDto> = new Array<VarselDto>();

    static getVarslerForPeriode = (varsler: Array<VarselDto>): Array<VarselDto> => {
        if (varsler === undefined || varsler === null) return [];
        const varslerCopy = [...varsler];
        return varslerCopy.map((varsel) => {
            const varselMedEndring = this.varslerMedEndring.find(
                (varselMedEndring) =>
                    varselMedEndring.generasjonId === varsel.generasjonId && varselMedEndring.kode === varsel.kode
            );
            return varselMedEndring
                ? { ...varsel, definisjonId: varselMedEndring.definisjonId, vurdering: varselMedEndring.vurdering }
                : varsel;
        });
    };

    static settStatusVurdert = ({
        generasjonId,
        definisjonId,
        varselkode,
        ident,
    }: MutationSettStatusVurdertArgs): boolean => {
        const { varselMedEndring, index } = this.findWithIndex(
            this.varslerMedEndring,
            (varselMedEndring) => varselMedEndring.generasjonId === generasjonId && varselMedEndring.kode === varselkode
        );

        if (varselMedEndring && varselMedEndring.vurdering?.status === Varselstatus.Vurdert) return false;

        let varselMedVurdering: VarselDto = varselMedEndring
            ? {
                  ...varselMedEndring,
                  vurdering: {
                      status: Varselstatus.Vurdert,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              }
            : {
                  definisjonId,
                  generasjonId,
                  kode: varselkode,
                  tittel: '',
                  forklaring: null,
                  handling: null,
                  vurdering: {
                      status: Varselstatus.Vurdert,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              };
        if (index !== -1) {
            this.varslerMedEndring[index] = varselMedVurdering;
        } else {
            this.varslerMedEndring.push(varselMedVurdering);
        }
        return true;
    };

    static settVarselstatusVurdert = ({
        generasjonIdString,
        definisjonIdString,
        varselkode,
        ident,
    }: MutationSettVarselstatusVurdertArgs): VarselDto | GraphQLError => {
        const { varselMedEndring, index } = this.findWithIndex(
            this.varslerMedEndring,
            (varselMedEndring) =>
                varselMedEndring.generasjonId === generasjonIdString && varselMedEndring.kode === varselkode
        );

        if (varselMedEndring?.vurdering && [Varselstatus.Vurdert].includes(varselMedEndring.vurdering.status)) {
            return new GraphQLError(
                `Varsel med varselkode=${varselkode}, generasjonId=${generasjonIdString} har ikke status AKTIV`,
                null,
                null,
                null,
                null,
                null,
                { code: 409 }
            );
        }

        let varselMedVurdering: VarselDto = varselMedEndring
            ? {
                  ...varselMedEndring,
                  vurdering: {
                      status: Varselstatus.Vurdert,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              }
            : {
                  definisjonId: definisjonIdString,
                  generasjonId: generasjonIdString,
                  kode: varselkode,
                  tittel: '',
                  forklaring: null,
                  handling: null,
                  vurdering: {
                      status: Varselstatus.Vurdert,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              };
        if (index !== -1) {
            this.varslerMedEndring[index] = varselMedVurdering;
        } else {
            this.varslerMedEndring.push(varselMedVurdering);
        }
        return varselMedVurdering;
    };

    static settStatusAktiv = ({ generasjonId, varselkode, ident }: MutationSettStatusAktivArgs): boolean => {
        const { varselMedEndring, index } = this.findWithIndex(
            this.varslerMedEndring,
            (varselMedEndring) => varselMedEndring.generasjonId === generasjonId && varselMedEndring.kode === varselkode
        );
        this.varslerMedEndring[index] = varselMedEndring
            ? {
                  ...varselMedEndring,
                  vurdering: {
                      status: Varselstatus.Aktiv,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              }
            : {
                  definisjonId: '',
                  generasjonId,
                  kode: varselkode,
                  tittel: '',
                  forklaring: null,
                  handling: null,
                  vurdering: {
                      status: Varselstatus.Aktiv,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              };
        return true;
    };

    static settVarselstatusAktiv = ({
        generasjonIdString,
        varselkode,
        ident,
    }: MutationSettVarselstatusAktivArgs): VarselDto | GraphQLError => {
        const { varselMedEndring, index } = this.findWithIndex(
            this.varslerMedEndring,
            (varselMedEndring) =>
                varselMedEndring.generasjonId === generasjonIdString && varselMedEndring.kode === varselkode
        );

        if (varselMedEndring?.vurdering && [Varselstatus.Godkjent].includes(varselMedEndring.vurdering.status)) {
            return new GraphQLError(
                `Varsel med varselkode=${varselkode}, generasjonId=${generasjonIdString} har ikke status GODKJENT`,
                null,
                null,
                null,
                null,
                null,
                { code: 409 }
            );
        }

        this.varslerMedEndring[index] = varselMedEndring
            ? {
                  ...varselMedEndring,
                  vurdering: {
                      status: Varselstatus.Aktiv,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              }
            : {
                  definisjonId: '',
                  generasjonId: generasjonIdString,
                  kode: varselkode,
                  tittel: '',
                  forklaring: null,
                  handling: null,
                  vurdering: {
                      status: Varselstatus.Aktiv,
                      ident: ident,
                      tidsstempel: dayjs().format(ISO_TIDSPUNKTFORMAT),
                  },
              };
        return this.varslerMedEndring[index];
    };

    static findWithIndex = (arr: Array<VarselDto>, predicate: (varsel: VarselDto) => boolean) => {
        const index = arr.findIndex(predicate);

        return {
            varselMedEndring: index !== -1 ? arr[index] : null,
            index,
        };
    };
}
