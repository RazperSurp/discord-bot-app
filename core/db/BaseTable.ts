import { GuildMember } from "discord.js";
import { Application } from "../core.ts";
import { PermissionSet } from "../permissions.ts";

interface SqlCondition {
    operator?: string,
    value: string | number | null | Array<string | number>
}

interface SqlConditionList {
    [index: string]: SqlCondition
}

export default class BaseTable {
    id: number = 0;
    isExists: boolean = false;
    [index: string]: any;

    static get table(): string { return this.name }
    get table(): string { return this.constructor.name }
    
    static async getById(id: number | string): Promise<BaseTable> {
        const result = await this.getOneByWhere({ id: { value: id } });
        if (result) return result;
        else throw 404;
    }

    static async all(): Promise<BaseTable[]> {
        return await this.getAllByWhere();
    }

    static getAllByWhere(conditions?: SqlConditionList): Promise<BaseTable[]> {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM "${this.table}" `;
            let statements = [];
            if (conditions !== null && conditions !== undefined && Object.keys(conditions as object).length > 0) {
                sql += 'WHERE ';
                for (const [field, condition] of Object.entries(conditions as object))
                    statements.push(`"${field}" ${condition.operator ?? '='} '${condition.value}'`);

                sql += statements.join(' AND ');
            }

            sql += ' ORDER BY "id" ASC';

            Application.instance.db?.all(sql, (err, result) => {
                if (err || !result) reject(err ?? result);
                else {
                    let instances: BaseTable[] = [];
                    result.forEach(row => { instances.push(new this(row, true)) })
                    resolve(instances)
                }
            })
        });
    }

    static async getOneByWhere(conditions: SqlConditionList): Promise<BaseTable> {
        return (await this.getAllByWhere(conditions))[0];
    }

    constructor(record: any | unknown, isExists = false) {
        this.isExists = isExists;
        if (typeof record == 'object' && !Array.isArray(record) && record !== null) {
            for (let [prop, value] of Object.entries(record)) {
                if (prop === 'id') this.id = record.id;
                else {
                    const propMasked = `_${prop}`;
                    if (prop.includes('permission')) value = new PermissionSet(value as any);
                    Object.defineProperty(this, propMasked, { value: value, writable: true });
                    Object.defineProperty(this, prop, {
                        enumerable: true,
                        get: () => { return this[propMasked] },
                        set: (newValue: any) => {
                            if (prop.includes('permission')) newValue = new PermissionSet(newValue);

                            if (this[prop] !== newValue) {
                                this[propMasked] = newValue;
                                Application.instance.db?.exec(`update ${this.table} set ${prop} = '${(newValue instanceof PermissionSet ? newValue.mask : newValue)}' where id = '${this.id}'`, err => {
                                    if (err) console.log(err);
                                });
                            }
                        },
                    });
                }
            }
        }
    }

    insert(): Promise<BaseTable> { 
        return new Promise((resolve, reject) => {
            const row = this;
            if (row.isExists) reject(409);
            else {
                const props = Object.keys(row).map(p => p !== 'isExists' && typeof row[p] !== 'function' && !p.startsWith('_') ? p : null).filter(p => { if (row.table == 'Users') { return p } else if (p !== 'id') { return p }}) as string[];
                const sql = `INSERT INTO ${row.table} (${props.join(', ') }) VALUES ('${props.map(p => row[p] instanceof PermissionSet ? row[p].mask : row[p]).join("', '")}')`;
                
                Application.instance.db?.run(sql, function (err) {
                  row.isExists = true;
                  row.id = this.lastID;
                  
                  resolve(row);
                })
            }
        }) 
    }
}