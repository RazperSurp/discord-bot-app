import { Client, Events, GatewayIntentBits } from 'discord.js';

import { Application } from "./core/core.ts";


const app = await Application.init(new Client({ intents: [GatewayIntentBits.Guilds] }));
// console.log(app.commands.ping.register());

setTimeout(() => {
	console.log(123)
}, 1000000);

// client.once(Events.ClientReady, (readyClient) => {
// 	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
// });
