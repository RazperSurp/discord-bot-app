import Users from "../db/users.ts";
import BaseCommand from "./BaseCommand.ts";
import type { ChatInputCommandInteraction } from 'discord.js';


export default class ping extends BaseCommand {
    _do(user: Users, interaction: ChatInputCommandInteraction): any {
        const msg = `иди нахуй ${user.showname} ёбаный`;

        interaction.reply((interaction.options.get('msg')?.value ?? msg) as string);

        return msg;
    }
}