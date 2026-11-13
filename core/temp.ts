import { Application } from "./core.ts";

export default class Temp {
    static cat = {};

    _id: string;
    get id(): string { return this._id; }

    _v: unknown;
    get v(): unknown { return this._v; }
    set v(val) {
        this._v = val;
        if (typeof this.v == 'function') this._name = (val as Function).name;
    }  

    _name?: string;
    get name(): string | undefined { return this._name }

    get type(): string | undefined { return typeof this.v; }
    get isFunction(): boolean { return this.type === 'function' }

    call(...args: any[]): unknown {
        return this.isFunction ? (this.v as Function)(...args) : this.v;
    }

    constructor(id: string, v: unknown) {
        this._id = id;
        this.v = v;
    }

    static get(id: string): Temp | undefined {
        return Application.TEMP[id];
    }

    drop() {
        delete Application.TEMP[this.id];
    }

    static new(id: string, v: any): Temp {
        const instance = new Temp(id, v);
        Application.TEMP[id] = instance;
        return instance;
    }


}