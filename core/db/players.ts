import BaseTable from "./BaseTable.ts";
import Users from "./users.ts";

export default class Players extends BaseTable {
    get user(): Promise<Users | undefined> { return Users.getById(this.users_id) as Promise<Users | undefined>; }
}
