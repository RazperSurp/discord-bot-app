import { Client, GatewayIntentBits, Events } from "discord.js";
import { Database } from 'sqlite3';
import config from './config.json' with { type: 'json' }
import { version } from '../../package.json' with { type: 'json' }

export namespace Core {
    type ModuleName = keyof ModulesConfigList;
    type Permission = typeof config.permissions[keyof typeof config.permissions];

    interface ModulesConfigList {
        [index: string]: ModuleConfig
    }

    const ModulesConfigs 

    interface ModuleConfig {
        isEnabled: boolean;
        doKeepAsInstance: boolean;
        description: string;
        dependencies:string[];
        extensions: Record<string, any>;
    }

    interface CommandModuleConfig extends ModuleConfig {
        permissions: Permission[]
    }

    class Application {
        get version(): string { return version };

        isOnline: boolean = false;

        _client?:  Client;
        get client(): Client | undefined { return this._client  };
        set client(client: Client) {
            this._client = client;
            this.isOnline = false;

            this._client.once(Events.ClientReady, (readyClient) => {
                this._client = readyClient;
                this.isOnline = true;
            });
        }

        _db: Database;
        get db(): Database { return this._db };

        constructor() {
            this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
            this._db = new Database(config.database.production);
        }

        includeModule(name: string): BaseModule | void {

        };
    }

    class PermissionSet {
        mask;

        constructor(mask = 0) {
            this.mask = mask;
        }

        has(permission: Permission): boolean {
            return (this.mask & permission) === permission;
        }

        add(...permissions: Permission[]): PermissionSet {
            let mask = this.mask;
            for (const p of permissions) mask |= p;
            return new PermissionSet(mask);
        }
        
        remove(...permissions: Permission[]): PermissionSet {
            let mask = this.mask;
            for (const p of permissions) mask &= ~p;
            return new PermissionSet(mask);
        }
    }

    class User {
        name: string
        permissions: PermissionSet

        static register(uuid: string, name: string): User
        static auth(uuid: string): User
    }

    class BaseModule {
        static get class(): string { return this.name }; 
        get class(): string { return this.constructor.name };

        _config: ModuleConfig;
        get config(): ModuleConfig;

        _app: Application;

        constructor(app: Application) {
            this._app = app;
            this._config = config.modules[this.class] satisfies ModuleConfig
        }
    }

    class BaseCommand extends BaseModule {
        permissions: Permission[]
    }
}