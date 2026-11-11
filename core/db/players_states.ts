import BaseTable from "./BaseTable.ts";

export default class PlayersStates extends BaseTable {
    get isDefault(): Boolean { return this.is_default === 1; }

    static async gameStates(idGame: number): Promise<PlayersStates[]> {
        return await PlayersStates.getAllByWhere({ games_id: { value: idGame }}) as PlayersStates[];
    }

    static async gameDefaultState(idGame: number): Promise<PlayersStates> {
        return (await PlayersStates.gameStates(idGame)).find(state => state.isDefault) as PlayersStates;
    }
}