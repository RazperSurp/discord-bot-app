import BaseCommand from "./BaseCommand.ts";
import { Application } from "../core.ts";
import Users from "../db/users.ts";
import Games from "../db/games.ts";
import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Lobbies from "../db/lobbies.ts";

export default class play extends BaseCommand {
    async _do(user: Users, interaction: ChatInputCommandInteraction): Promise<any> {
        const game = await Games.getOneByWhere({ name: { value: interaction.options.get('game')?.value as string } });
        if (game?.id) {
            const lobby = await Lobbies.new(user, game.id);

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`${game.name_ru}: ${game.description}`)
                .setAuthor({ name: `${user.showname} создал новое лобби`, iconURL: `${interaction.user.displayAvatarURL()}` })
                .setTimestamp()
                .setFooter({ text: `Приглашение в лобби #${lobby.id}` });

            const confirm = new ButtonBuilder()
                .setLabel('Делаем')
                .setStyle(ButtonStyle.Success)
                .setCustomId(JSON.stringify({ type: Application.BUTTON_INTERACTION_TYPE.GAME, action: Games.ACTION_TYPE.JOIN, lobby: lobby.id }));

            const cancel = new ButtonBuilder()
                .setLabel('я чмо')
                .setStyle(ButtonStyle.Danger)
                .setCustomId(JSON.stringify({ type: Application.BUTTON_INTERACTION_TYPE.GAME, action: Games.ACTION_TYPE.DECLINE, lobby: lobby.id }));

            interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(confirm, cancel) as any] });
        } else throw 404;
    }
}