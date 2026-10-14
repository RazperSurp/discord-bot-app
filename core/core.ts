import { Client, Events, GatewayIntentBits, GuildMember, MessageFlags, REST, Routes } from 'discord.js';


import pkg from 'discord.js';
const { Interaction } = pkg;
import path from 'path'; 

import sqlite3 from 'sqlite3';

import config from './config.json' with { type: 'json' };
import { Users } from './db/tables.ts';

interface IncludedCommandsList { [index: string]: any }
 
export class Application {
    static instance: Application; 

    isClientOnline: boolean = false;

    _client?: Client;
    get client(): Client | undefined { return this._client }
    set client(client: Client) {
        if (!this._client) {
            this._client = client;
            this.isClientOnline = false;

        }
    }

    _rest?: REST
    get rest(): REST | undefined { return this._rest }
    set rest(value) {
        if (this.isClientOnline) this._rest = value;
        else console.error('token wasnt validated yet.');
    }

    db: sqlite3.Database;
    commands: IncludedCommandsList = {}

    constructor(client: Client) {
        console.log(`connecting db from ${path.resolve(config.database.production)}...`)
        this.db = new sqlite3.Database(path.resolve(config.database.production), sqlite3.OPEN_READWRITE)
        this.client = client;

    }

    static init(client: Client): Promise<Application> {
        return new Promise(async (resolve, reject) => {
            Application.instance = new Application(client);

            for (const name of Object.keys(config.commands.list)) {
                await Application.instance.includeCommand(name);
            }

            console.log(`using token "${process.env.DISCORD_TOKEN?.substring(0,4)}****${process.env.DISCORD_TOKEN?.substring(process.env.DISCORD_TOKEN.length - 4)}"...`);
            Application.instance.client?.login(process.env.DISCORD_TOKEN);
            Application.instance.client?.once(Events.ClientReady, (readyClient) => {
                Application.instance.client = readyClient;
                Application.instance.isClientOnline = true;
                Application.instance.rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

                console.log(`using token "${process.env.DISCORD_TOKEN?.substring(0,4)}****${process.env.DISCORD_TOKEN?.substring(process.env.DISCORD_TOKEN.length - 4)}"... OK as ${Application.instance.client.user?.tag}`);
                Application.instance.registerCommands().then(() => {
                    Application.instance.client?.on(Events.InteractionCreate, interaction => { return Application.instance.handleInteraction(interaction) })

                    resolve(Application.instance);
                });
            });
        })
    }

    async auth(member: GuildMember): Promise<Users> {
        return new Promise((resolve, reject) => {
            Users.getById(member.user.id).then(user => {
                if (!user) {
                    this.db.exec(`insert into users (id, username, showname, permissions) values (${member.id}, '${member.user.username}', '${member.displayName}', ${config.permissions.canUseBasicCommands})`);
                    Users.getById(member.user.id).then(user => { resolve(user) });
                } else resolve(user);
            });
        })
    }

    async handleInteraction(interaction: typeof Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const user = await this.auth(interaction.member);

        console.log(`called ${interaction.commandName} by @${user.showname}#${user.id}...`)
        if (!this.commands.hasOwnProperty(interaction.commandName)) {
            console.error(`called ${interaction.commandName} by @${user.showname}#${user.id}... ERR (404)`);
            return interaction.reply('такой команды нет еблан утырок даун дятел козёл простфиля придурок дибил отстань');
        }

        try {
            const result = await this.commands[interaction.commandName].execute(user, interaction);
            console.log(`called ${interaction.commandName} by @${user.showname}#${user.id}... OK got ${result}`);
        } catch (error) {
            console.error(`called ${interaction.commandName} by @${user.showname}#${user.id}... ERR`);
            console.error(error);
            if (error === 403) await interaction.reply({
                content: 'недостаточно прав лол ты что женщина?? XDDD',
                flags: MessageFlags.Ephemeral,
            }); else if (interaction.replied || interaction.deferred) await interaction.followUp({
                content: 'произошла ошибка при выполнении команды',
                flags: MessageFlags.Ephemeral,
            }); else await interaction.reply({
                content: 'произошла ошибка при выполнении команды',
                flags: MessageFlags.Ephemeral,
            });
        }

    }

    async registerCommands() {
        let commands = []

        console.log(`registering commands...`)
        for (const [name, commandClass] of Object.entries(this.commands)) {
            console.log(`- preparing ${name}...`);
            commands.push(commandClass.getSlashBuilder().data.toJSON());
            console.log(`- preparing ${name}... OK`);
        }
        console.log(`registering commands... OK`)

        console.log(`putting commands to rest...`)
        this.client?.guilds.cache.each((guild, id) => {
            console.log(`- putting commands on G#${id}...`)
            this.rest?.put(Routes.applicationGuildCommands(this.client?.user?.id ?? '', id), { body: commands });
            console.log(`- putting commands on G#${id}... OK`)
        })
        console.log(`putting commands to rest... OK`)
    }

    async includeCommand(name: string) {
        try {
            console.log(`including command: ${name}...`)
            
            const resolve = await import(`${config.commands.path}/${name}.ts`);
            this.commands[name] = resolve.default;

            console.log(`including command: ${name}... OK`)
        } catch (e) {
            console.log(`including command: ${name}... ERR`)
            console.warn(e);
        }
    } 
}