import BaseCommand from "./BaseCommand.ts";
import { Application } from "../core.ts";
import Users from "../db/users.ts";
import Games from "../db/games.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;

export default class play extends BaseCommand {
    async _do(user: Users, interaction: Interaction): any {
        const game = await Games.getOneByWhere({ name: { value: interaction.options.get('game')?.value as string } });
        if (game?.id) {
            interaction.reply(game.name);
        } else throw 404;
    }
}