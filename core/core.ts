import { Client, Events, GatewayIntentBits } from 'discord.js';
import sqlite3 from 'sqlite3';

import config from './config.json' with { type: 'json' };

interface IncludedCommandsList { [index: string]: Function }
 
export class Application {
    static instance: Application; 

    isClientOnline: boolean = false;

    _client?: Client;
    get client(): Client | undefined { return this._client }
    set client(client: Client) {
        if (!this._client) {
            this._client = client;
            this.isClientOnline = false;

            this._client.once(Events.ClientReady, (readyClient) => {
                this._client = readyClient;
                this.isClientOnline = true;
            });
        }
    }

    db: sqlite3.Database;
    commands: IncludedCommandsList = {}

    constructor(client: Client) {
        this.db = new sqlite3.Database(config.database.production)
        this.client = client;

    }

    static async init(client: Client): Promise<Application> {
        Application.instance = new Application(client);

        for (const name of Object.keys(config.commands.list)) {
            await Application.instance.includeCommand(name);
        }

        return Application.instance;
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