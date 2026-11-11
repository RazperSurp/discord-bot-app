import BaseTable from "./BaseTable.ts";

export default class Games extends BaseTable {
    static ACTION_TYPE = {
        JOIN: 1,
        DECLINE: 2
    }
}
