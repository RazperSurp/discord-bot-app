import { commands } from '../config.json' with { type: 'json' }
import { PermissionSet } from '../permissions';
const commandsList: CommandsList = commands; 


export interface CommandsList { [index: string]: CommandConfig }
export interface CommandArgumentsList { [index: string]: CommandArgument }
export interface CommandArgument {
    type: string;
    default: any;
    isRequired: boolean;
    description: string;
}

export type CommandName = keyof typeof commands;

export interface CommandConfig {
    permissions: number[];
    description: string;
    arguments: CommandArgumentsList;
}


export abstract class BaseCommand {

    static get class(): CommandName | string { return this.name  }
    get class(): CommandName | string { return this.constructor.name }

    get description(): string { return commandsList[this.class].description }
    get config(): CommandConfig { return commandsList[this.class] }
    get arguments(): CommandArgumentsList { return commandsList[this.class].arguments }

    permissions: PermissionSet;
    result?: unknown; 

    constructor() {
        this.permissions = new PermissionSet(this.config.permissions.reduce((acc, p) => acc |= p))
    }

    call(...args: any[]): void {
        Object.keys(this.arguments)
    }
}