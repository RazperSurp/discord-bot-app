import Users from "../db/users.ts";
import BaseCommand from "./BaseCommand.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;


export default class ping extends BaseCommand {
    _do(user: Users, interaction: Interaction): any {
        const msg = `иди нахуй, ${user.showname} ёбаный, чё за ник блять "${user.showname}" ебанатский`;

        interaction.reply(interaction.options.get('msg')?.value ?? msg);

        return msg;
    }
}