import config from '../config.json' with { type: 'json' }
import { PermissionSet } from '../permissions.ts';

const commandsList: CommandsList = config.commands.list; 

export type CommandName = keyof typeof config.commands;
export interface CommandsList { [index: string]: CommandConfig }
export interface CommandArgumentsList { [index: string]: CommandArgument }
export interface PassedArgumentsList { [index: string]: any }
export interface CommandArgument {
    type: string;
    default: any;
    isRequired: boolean;
    description: string;
}

export interface CommandConfig {
    permissions: number[];
    description: string;
    arguments: CommandArgumentsList;
}

export default class BaseCommand {
    static get class(): CommandName | string { return this.name }
    get class(): CommandName | string { return this.constructor.name }

    get description(): string { return commandsList[this.class].description }
    get config(): CommandConfig { return commandsList[this.class] }
    get arguments(): CommandArgumentsList { return commandsList[this.class].arguments }

    _app: any;

    // permissions: PermissionSet;
    result?: unknown; 

    constructor(...args: any[]) {
        // this.permissions = new PermissionSet(this.config.permissions.reduce((acc, p) => acc |= p))
        this.result = this.call(args);
    }

    static execute(...args: any[]) {
        const instance = new this(args);
        return instance.result;
    }

    call(...args: any[]): any {
        let namedArgs: PassedArgumentsList = {};

        Object.keys(this.arguments).forEach((k, i) => { namedArgs[k] = args[i] })
        return this._do(namedArgs);
    }

    _do(namedArgs: PassedArgumentsList): any { }
}