import { Application } from "../core.ts";
import { PermissionSet } from "../permissions.ts";

export class Users {
    id: string | undefined;

    _username: string | undefined;
    get username(): string | undefined { return this._username }
    set username(value: string) {
        this._username = value;
        Application.instance.db.exec(`update users set username = '${value}' where id = '${this.id}'`);
    }

    _showname: string | undefined;
    get showname(): string | undefined { return this._showname }
    set showname(value: string) {
        this._showname = value;
        let sql = `update users set showname = '${value}' where id = '${this.id}'`;
        Application.instance.db.exec(sql, (err) => {
            console.log([sql, err]);
        });
    }
    
    _permissions: PermissionSet | undefined;
    get permissions(): PermissionSet | undefined { return this._permissions }
    set permissions(value: number) {
        this._permissions = new PermissionSet(value);
        Application.instance.db.exec(`update users set permissions = '${value}' where id = ${this.id}`);
    } 

    constructor(userdata: Record<string, any>) {
        if (userdata.id) {   
            this.id = userdata.id;
            this._username = userdata.username;
            this._showname = userdata.showname;
            this._permissions = new PermissionSet(userdata.permissions);
        }
    }
}