import BaseCommand from "./BaseCommand.ts";
import { Application } from '../core.ts';
import pkg from 'discord.js';
import Users from "../db/users.ts";
import Games from "../db/games.ts";
const { Interaction } = pkg;


export default class sql extends BaseCommand {
    async _do(user: Users, interaction: Interaction): Promise<any>   {
        const statement = interaction.options.get('statement').value;
        
        // const user1 = new Games({ name: 1, description: 2, name_ru: 1, available: 0  });
        // await user1.insert();
        console.log(user1);

        // Application.instance.db.get(interaction.options.get('statement').value, (err, result) => {
        //     console.log(result);
            interaction.reply('bruh.')
        // });
        
        return interaction.options.get('statement').value;
    }
}