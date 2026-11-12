import BaseCommand from "./BaseCommand.ts";
import { Application } from "../core.ts";
import Users from "../db/users.ts";
import Games from "../db/games.ts";
import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import Lobbies from "../db/lobbies.ts";

export default class play extends BaseCommand {
    async _do(user: Users, interaction: ChatInputCommandInteraction): Promise<any> {
        const game = await Games.getOneByWhere({ name: { value: interaction.options.get('game')?.value as string } });
        if (game?.id) {
            const lobby = await Lobbies.new(user, game.id);
            const struct = await lobby.generateOpenMessage();

            const response = await interaction.reply({ embeds: struct.embeds, components: struct.components });
            const message = await response.fetch()

            const thread = await message.startThread({
                name: `Лобби#${lobby.id} - ${game.name}`,
                autoArchiveDuration: 60, // Время в минутах до архивации (опционально)
            });
            
            lobby.thread_id = thread.id;
        } else throw 404;
    }
}