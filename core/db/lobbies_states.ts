import BaseTable from "./BaseTable.ts";

export default class LobbiesStates extends BaseTable {
    get isDefault(): Boolean { return this.is_default === 1; }

    static async gameStates(idGame: number): Promise<LobbiesStates[]> {
        return await LobbiesStates.getAllByWhere({ games_id: { value: idGame }}) as LobbiesStates[];
    }

    static async gameDefaultState(idGame: number): Promise<LobbiesStates> {
        return (await LobbiesStates.gameStates(idGame)).find(state => state.isDefault) as LobbiesStates;
    }
}