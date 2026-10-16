import config from '../config.json' with { type: 'json' }
import { Application } from '../core.ts';
import Users from '../db/users.ts';
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
    table?: string;
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
            instance.result = await instance.call(user, interaction);
        else throw 403;
        
        return instance.result;
    }

    async call(user: Users, interaction: typeof Interaction): Promise<unknown> {
        try {
            const result = await this._do(user, interaction);
            return result;
        } catch (err) {
            console.error(`called ${this.class}... ERR`)
            console.error(err);
        }
        
    }

    async _do(user: Users, interaction: typeof Interaction): Promise<any> { }

    static async getSlashBuilder() {
        let options = [], builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.config.description);

        for (const [name, arg] of Object.entries(this.config.arguments)) {
            console.log(arg.type == 'select', arg.table, typeof Application.instance.db?.tables[arg.table as string] == 'function');

            if (arg.type == 'select' && !arg.table) console.warn(`warn: type of ${this.name} - ${name} is SELECT but table wasnt passed`);
            else if (arg.type == 'select' && arg.table && typeof Application.instance.db?.tables[arg.table as string] == 'function') {
                options = (await Application.instance.db?.tables[arg.table].all()).map(row => { return { value: row.name, name: `${row.name_ru} - ${row.description}` } });
                console.log(options);
            }

            builder = builder.addStringOption((option: any) => {
                let optionSchema = option.setName(name)
                    .setDescription(arg.description)
                    .setRequired(arg.isRequired);

                if (options.length > 0) optionSchema = optionSchema.addChoices(options);
                

                return optionSchema;
            });

        }


        return {
            data: builder,
            execute: this.execute
        }
    }
}