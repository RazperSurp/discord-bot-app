import config from '../config.json' with { type: 'json' }
import { Users } from '../db/tables.ts';
import { PermissionSet } from '../permissions.ts';

import pkg from 'discord.js';
const { Interaction, SlashCommandBuilder } = pkg;

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

    static get description(): string { return commandsList[this.class].description }
    get description(): string { return commandsList[this.class].description }

    static get config(): CommandConfig { return commandsList[this.class] }
    get config(): CommandConfig { return commandsList[this.class] }

    static get arguments(): CommandArgumentsList { return commandsList[this.class].arguments }
    get arguments(): CommandArgumentsList { return commandsList[this.class].arguments }

    _app: any;

    permissions: PermissionSet;
    result?: unknown; 

    constructor(interaction: typeof Interaction) {
        this.permissions = new PermissionSet(this.config.permissions.reduce((acc, p) => acc |= p))
    }

    static async execute(user: Users, interaction: typeof Interaction): Promise<unknown> {
        const instance = new this(interaction);
        if (user.permissions?.has(instance.permissions.mask))
            instance.result = await instance.call(interaction);
        else throw 403;
        
        return instance.result;
    }

    async call(interaction: typeof Interaction): Promise<unknown> {
        console.log(`called ${this.class}...`)
        try {
            const result = await this._do(interaction);
            console.log(`called ${this.class}... OK got ${result}`)
            return result;
        } catch (err) {
            console.error(`called ${this.class}... ERR`)
            console.error(err);
        }
        
    }

    async _do(interaction: typeof Interaction): Promise<any> { }

    static getSlashBuilder() {
        let builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.config.description);

        for (const [name, options] of Object.entries(this.config.arguments)) {
            builder = builder.addStringOption((option: any) => option.setName(name).setDescription(options.description).setRequired(options.isRequired))
        }

        return {
            data: builder,
            execute: this.execute
        }
    }
}