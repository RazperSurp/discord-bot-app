import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Application } from "./core/core.ts";

const app = await Application.init(new Client({ intents: [GatewayIntentBits.Guilds] }));
