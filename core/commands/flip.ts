import BaseCommand from "./BaseCommand.ts";
import pkg from 'discord.js';
const { Interaction } = pkg;

export default class flip extends BaseCommand {
    _do(interaction: Interaction): any {        
        const side = Math.round(Math.random()) == 0 ? 'Решка' : 'Орёл';
        interaction.reply(side);
        return side;
    }
}