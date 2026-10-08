import { Client } from "discord.js";


declare namespace Core {
    type ModuleConfig = {
        isEnabled: boolean;
        doKeepAsInstance: boolean;
        dependencies: Array<string>;
        extensions: Record<string, any>;
    }

    class Application {
        get version(): string;
        get isOnline(): boolean;

        _client:  Client;
    }

    class BaseModule {
        _config: ModuleConfig;
        get config(): ModuleConfig;
        set config(value: ModuleConfig);

        _name: string;
        get name(): string;

        _core: Application;
    }
}

export = Core;