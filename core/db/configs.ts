import BaseTable from "./BaseTable.ts";
import ConfigParams from "./config_params.ts";
import Games from "./games.ts";

export default class Configs extends BaseTable {
    _params: Record<string, any> = {};
    get params(): Record<string, any> { return this._params }

    get game(): Promise<Games> { return Games.getById(this.games_id) as Promise<Games> }

    constructor(record: Record<string, any> | any | unknown, isExists = false) {
        super(record, isExists);

        if (isExists) {
            let params = {};
            // ConfigParams.getAllByWhere({ configs_id: { value: this.id } }).then;
        }
    }




}
