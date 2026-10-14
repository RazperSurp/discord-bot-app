import { Application } from "../core.ts";
import { PermissionSet } from "../permissions.ts";

class BaseTable {
    id: number = 0;
    [index: string]: any;

    static get table(): string { return this.name }
    get table(): string { return this.constructor.name }
    
    static getById(id: number | string): Promise<BaseTable> {
        return new Promise((resolve, reject) => {
            Application.instance.db.get(`select * from ${this.name} where id = '${id}'`, (err, result) => {
                if (err) reject(err);
                else resolve(new this(result));
            })
        })
    }

    constructor(record: any) {
        if (typeof record == 'object' && !Array.isArray(record) && record !== null) {
            for (let [prop, value] of Object.entries(record)) {
                if (prop === 'id') this.id = record.id;
                else {
                    const propMasked = `_${prop}`;
                    if (prop.includes('permission')) value = new PermissionSet(value as any);
                    Object.defineProperty(this, propMasked, { value: value });
                    Object.defineProperty(this, prop, {
                        get: () => { return this[propMasked] },
                        set: (newValue: any) => {
                            if (prop.includes('permission')) newValue = new PermissionSet(newValue);

                            if (this[prop] !== newValue) {
                                Application.instance.db.exec(`update ${this.table} set ${prop} = '${(newValue instanceof PermissionSet ? newValue.mask : newValue)}' where id = '${this.id}'`, err => {
                                    if (err) console.log(err);
                                    else this[propMasked] = newValue;
                                });
                            }
                        },
                    });
                }
            }
        }
    }
}

export class Users extends BaseTable { }
