import { Client } from "discord.js";
import { sqlite3, Database } from 'sqlite3';
import { permissions } from './config.json' with { type: 'json' }


export declare namespace Core {
    type Permission = typeof permissions[keyof typeof permissions];

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
        get version(): string;
        get isOnline(): boolean;

        _client:  Client;
        get client(): Client;

        _db: Database;
        get db(): Database;

        includeModule(name: string): void;
    }

    class PermissionSet {
        constructor(mask?: number);
        has(permission: number): boolean;
        add(...permissions: number[]): PermissionSet;
        remove(...permissions: number[]): PermissionSet;
    }

    class User {
        name: string
        permissions: PermissionSet

        static register(uuid: string, name: string): User
        static auth(uuid: string): User
    }

    class BaseModule {
        get name(): string;

        _config: ModuleConfig;
        get config(): ModuleConfig;
        set config(value: ModuleConfig);

        _app: Application;

        constructor(core: Core.Application);
    }

    class BaseCommand extends BaseModule {
        permissions: Permission[]
    }
}