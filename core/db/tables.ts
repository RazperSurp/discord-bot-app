import { Application } from "../core.ts";
import { PermissionSet } from "../permissions.ts";

class BaseTable {
    id: number = 0;
    [index: string]: any;

    static get table(): string { return this.name }
    get table(): string { return this.constructor.name }
    
    static getById(id: number): Promise<BaseTable> {
        return new Promise((resolve, reject) => {
            Application.instance.db.get(`select * from ${this.name} where id = '${id}'`, (err, result) => {
                if (err) reject(err);
                else resolve(new this(result));
            })
        })
    }

    constructor(record: any) {
        if (typeof record == 'object' && !Array.isArray(record) && record !== null) {
            for (const [prop, value] of Object.entries(record)) {
                if (prop !== 'id') this.id = record.id;
                else Object.defineProperty(this, prop, {
                    get: () => { return this[prop] },
                    set: (newValue: any) => {
                        if (this[prop] !== newValue) {
                            Application.instance.db.exec(`update ${this.table} set ${prop} = '${newValue}' where id = '${this.id}'`, err => {
                                if (err) console.log(err);
                                else this[prop] = newValue;
                            });
                        }
                    },
                });

            }
        }
    }
}

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

export class Games {
    id: number;
    name: string;
}