import BaseCommand from "./BaseCommand.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;


export default class ping extends BaseCommand {
    _do(interaction: Interaction): any {
        const msg = 'pong';

        interaction.reply(interaction.options.get('msg')?.value ?? msg);

        return msg;
    }
}