import BaseTable from "./BaseTable.ts";
import Configs from "./configs.ts";

export default class Games extends BaseTable {
    static ACTION_TYPE = {
        JOIN: 1,
        DECLINE: 2,
        START: 3,
        STOP: 4
    }

    async getPlayersLimits(): Promise<Record<string, number>> {
        const configs = await Configs.getAllByWhere({ games_id: { value: this.id } });

        return {
            min: configs.reduce((min, config) => min > config.min_players ? config.min_players : min, Number.POSITIVE_INFINITY),
            max: configs.reduce((max, config) => max < config.max_players ? config.max_players : max, Number.NEGATIVE_INFINITY)
        };
    }
}
