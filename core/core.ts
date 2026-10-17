import { Client, Events, GatewayIntentBits, GuildMember, MessageFlags, REST, Routes } from 'discord.js';

import fs from 'fs';
import type { Interaction } from 'discord.js';
import path from 'path'; 

import sqlite3 from 'sqlite3';

import config from './config.json' with { type: 'json' };
import Users from './db/users.ts';



interface IncludedCommandsList { [index: string]: any }
interface DatabaseExtended extends sqlite3.Database {
    tables: Record<string, any>
}
 
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

    db?: DatabaseExtended;
    commands: IncludedCommandsList = {}

    constructor(client: Client) {
        this.client = client;
    }

    openDb(): Promise<DatabaseExtended> {
        return new Promise((resolve, reject) => {

            const dbPath = path.resolve(config.database.production);

            if (!fs.existsSync(dbPath)) {
                console.log(`production db not found, cloning from ${config.database.migration}...`);
                fs.copyFileSync(path.resolve(config.database.migration), dbPath);
            }

            console.log(`opening db from ${path.resolve(config.database.production)}...`)
            let db = new sqlite3.Database(path.resolve(config.database.production), sqlite3.OPEN_READWRITE, openErr => {
                db = Object.defineProperty(db, 'tables', { value: {}, writable: true });

                if (openErr) {
                    console.error(`opening db from ${path.resolve(config.database.production)}... ERR`)
                    console.error(openErr);
                    reject(openErr);
                } else {
                    console.log(`opening db from ${path.resolve(config.database.production)}... OK`)
                    console.log(`importing tables models...`)
                    db.all('SELECT DISTINCT "tbl_name" FROM "sqlite_master"', (async (err, rows) => {
                        if (err) reject(err);
                        else {
                            for (const row of rows as Record<string, any>[] ) {
                                console.log(`- importing "${row.tbl_name}"...`)
                                try {
                                    const resolve = await import(`./db/${row.tbl_name}.ts`);
                                    db.tables = Object.defineProperty(db.tables, row.tbl_name, { value: resolve.default }) 
                                    console.log(`- importing "${row.tbl_name}"... OK`)
                                } catch(importErr) {
                                    console.error(`- importing "${row.tbl_name}"... ERR, no model found`)
                                }
                            }

                            console.log(`importing tables models... OK`)
                            resolve(db as DatabaseExtended);
                        }
                    }))
                }
            }) as DatabaseExtended;
        })    
    }

    static init(client: Client): Promise<Application> {
        return new Promise(async (resolve, reject) => {
            Application.instance = new Application(client);
            
            Application.instance.db = await Application.instance.openDb();

            for (const name of Object.keys(config.commands.list)) await Application.instance.includeCommand(name);

            console.log(`using token "${process.env.DISCORD_TOKEN?.substring(0,4)}****${process.env.DISCORD_TOKEN?.substring(process.env.DISCORD_TOKEN.length - 4)}"...`);
            try {
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
            } catch (err) {
                console.error(err);
            }
        })
    }

    async auth(member: GuildMember): Promise<Users> {
        return new Promise((resolve, reject) => {
            this.db?.tables.users.getById(member.user.id).then((user: Users) => {
                if (user) resolve(user);
            }).catch(() => { (new Users({ id: member.user.id, username: member.user.username, showname: member.displayName, permissions: config.permissions.canUseBasicCommands })).insert().then(newUser => { resolve(newUser as Users) }) });
        })
    }

    async handleInteraction(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const user = await this.auth(interaction.member as GuildMember);
        user.actualize(interaction.member as GuildMember);

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

            let msg = 'произошла ошибка';

            switch ((error as any)?.code) {
                case 400: msg = 'некорректный запрос'; break;
                case 401: msg = 'авторизация не пройдена'; break;
                case 403: msg = 'недостаточно прав'; break;
                case 404: msg = 'не найдено'; break;
                case 422: msg = 'некорректные параметры'; break;
                case 429: msg = 'слишком много запросов'; break;
            } 
            
            await interaction.replied || interaction.deferred ? interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }) : interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
        }

    }

    async registerCommands() {
        let commands = []

        console.log(`registering commands...`)
        for (const [name, commandClass] of Object.entries(this.commands)) {
            console.log(`- preparing ${name}...`);
            commands.push((await commandClass.getSlashBuilder()).data.toJSON());
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