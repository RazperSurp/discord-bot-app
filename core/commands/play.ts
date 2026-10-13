import BaseCommand from "./BaseCommand.ts";
import { Application } from "../core.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;


export default class play extends BaseCommand {
    _do(interaction: Interaction): any {
        const game = interaction.options.get('game')?.value;

        const msg = 'pong';

        interaction.reply(interaction.options.get('game')?.value ?? msg);

        return msg;
    }
}