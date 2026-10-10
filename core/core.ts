import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Database } from 'sqlite3';

import config from './config.json' with { type: 'json' };

interface IncludedCommandsList { [index: string]: Function }
 
export class Application {
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

    db: Database;
    commands: IncludedCommandsList = {}

    constructor(client: Client) {
        this.db = new Database(config.database.production)
        this.client = client;

    }

    static async init(client: Client) {
        const instance = new Application(client);

        for (const name of Object.keys(config.commands.list)) {
            await instance.includeCommand(name);
        }

        return instance;
    }

    async includeCommand(name: string) {
        try {
            console.log(`including command: ${name}...`)
            
            const resolve = await import(`${config.commands.path}/${name}.ts`);
            this.commands[name] = resolve[name];

            console.log(`including command: ${name}... OK`)
        } catch (e) {
            console.log(`including command: ${name}... ERR`)
            console.warn(e);
        }
        // this.commands[name] = 
    } 
}