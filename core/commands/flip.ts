import Users from "../db/users.ts";
import BaseCommand from "./BaseCommand.ts";
import type { ChatInputCommandInteraction } from 'discord.js';

export default class flip extends BaseCommand {
    _do(user: Users, interaction: ChatInputCommandInteraction): any {        
        const side = Math.round(Math.random()) == 0 ? 'Решка' : 'Орёл';
        interaction.reply(side);
        return side;
    }
}