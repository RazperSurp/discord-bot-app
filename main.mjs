// import { Client, Events, GatewayIntentBits } from 'discord.js';

import { Application } from "./core/core.ts";


const app = new Application(new Client({ intents: [GatewayIntentBits.Guilds] }));
console.log(app);

setTimeout(() => {
	console.log(123)
}, 5050050);

// client.once(Events.ClientReady, (readyClient) => {
// 	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
// });
// client.login(token);