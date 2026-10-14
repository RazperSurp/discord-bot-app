import BaseCommand from "./BaseCommand.ts";
import { Application } from '../core.ts';
import pkg from 'discord.js';
import { Users } from "../db/tables.ts";
const { Interaction } = pkg;


export default class sql extends BaseCommand {
    _do(user: Users, interaction: Interaction): any {
        const statement = interaction.options.get('statement').value;
        console.log(statement);
        Application.instance.db.get(interaction.options.get('statement').value, (err, result) => {
            console.log(result);
            interaction.reply('bruh.')
        });
        
        return interaction.options.get('statement').value;
    }
}