import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Database } from 'sqlite3';

import config from './config.json' with { type: 'json' };
 
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

    constructor(client: Client) {
        this.db = new Database(config.database.production)
        this.client = client;
    }

    includeCommand(name: string) {

    } 
}