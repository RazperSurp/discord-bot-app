import BaseCommand from "./BaseCommand.ts";
import { Application } from "../core.ts";
import { Users, Games } from "../db/tables.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;

export default class play extends BaseCommand {
    async _do(user: Users, interaction: Interaction): any {
        const game = await Games.getOneByWhere({ name: { value: interaction.options.get('game')?.value as string } });
        interaction.reply(String(game?.id ?? 404));

        return game?.id ?? 404;
    }
}