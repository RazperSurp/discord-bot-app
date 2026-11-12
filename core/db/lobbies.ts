import config from '../config.json' with { type: 'json' };

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, MessageFlags, ThreadChannel, Message } from "discord.js";
import { Application } from "../core.ts";
import BaseTable from "./BaseTable.ts";
import Configs from "./configs.ts";
import LobbiesStates from "./lobbies_states.ts";
import Players from "./players.ts";
import Users from "./users.ts";
import Games from "./games.ts";
import PlayersStates from "./players_states.ts";

export default class Lobbies extends BaseTable {
    _config: Configs;
    get config(): Configs { return this._config } 

    _states: LobbiesStates[];
    get states(): LobbiesStates[] { return this._states }
    get state(): LobbiesStates | undefined { return this.states.find(obj => obj.id === this.lobbies_states_id) }

    get players(): Promise<Players[]> { return Players.getAllByWhere({ lobbies_id: { value: this.id } }) as Promise<Players[]> }

    get thread(): ThreadChannel | null | undefined { return Application.instance.client?.channels.cache.find(channel => channel.id == this.thread_id) as ThreadChannel | null | undefined }
    get message(): Message | undefined { 
        const thread = this.thread;
        return ((thread?.parent as any)?.messages.cache as Message[]).find(message => message.id == thread?.id) ;
    }

    constructor(record: Record<string, any> | any | unknown, isExists = false, config: Configs | null = null, states: LobbiesStates[] | null = null, defaultState: LobbiesStates | null = null) {
        super(record, isExists);
        this._config = (config ?? Configs.getById(this.configs_id)) as Configs; 
        this._states = (states ?? LobbiesStates.getAllByWhere({ games_id: { value: (this.config).games_id }})) as LobbiesStates[]; 
        this.lobbies_states_id = (defaultState?.id ?? LobbiesStates.gameDefaultState(this.config.games_id)) as number;
    }

    static new(user: Users, idGame: number): Promise<Lobbies> {
        return new Promise(async (resolve, reject) => {
            const states = await LobbiesStates.getAllByWhere({ games_id: { value: idGame } });
            const config = await Configs.getOneByWhere({ games_id: { value: idGame } });
            const defaultState = await LobbiesStates.gameDefaultState(idGame);

            let lobby = new this({ 
                creator_id: user.id,
                lobbies_states_id: states[0].id,
                configs_id: config.id,
                thread_id: null,
            }, false, config as Configs, states as LobbiesStates[], defaultState as LobbiesStates);

            await lobby.insert();

            lobby.addPlayer(user);
            resolve(lobby);
        })
    }

    static async join(user: Users, interaction: ButtonInteraction, id: number) {
        const lobby = await Lobbies.getById(id) as Lobbies;
        if (!lobby) throw 404;
        else {
            if ((await lobby.players).find(player => player.users_id == user.id)) throw 409;
            await lobby.addPlayer(user);

            const struct = await lobby.generateOpenMessage();

            lobby.message?.edit({ embeds: struct.embeds, components: struct.components });
            lobby.thread?.send(`${interaction.member} присоединился`);
            interaction.reply({ content: 'ураураура', flags: MessageFlags.Ephemeral });
        } 
    } 

    static async decline(user: Users, interaction: ButtonInteraction, id: number) {
        const lobby = await Lobbies.getById(id) as Lobbies;
        if (!lobby) throw 404;
        else {
            const player = (await lobby.players).find(player => player.users_id == user.id);

            if (player === undefined) throw 409;
            else {
                player.delete();
                
                const struct = await lobby.generateOpenMessage();
                lobby.message?.edit({ embeds: struct.embeds, components: struct.components });
                lobby.thread?.send(`${interaction.member} отключился`);

                return interaction.reply({ content: 'Знаете, есть такой мем: "У ТЕБЯ НОЖ В СПИНЕ!...  ..... ... мне похуй...."', flags: MessageFlags.Ephemeral });
            }
        }
    } 

    async addPlayer(user: Users) {
        const state = await PlayersStates.gameDefaultState((await this.config).games_id);

        let player = await (new Players({
            users_id: user.id,
            lobbies_id: this.id,
            players_states_id: state.id
        }, false)).insert();

        return player;
    }

    async generateOpenMessage(): Promise<Record<string, any>> {
        const game = await Games.getById((await this.config).games_id) as Games;
        const limit = await game.getPlayersLimits();
        const creator = await Users.getById(this.creator_id);

        let i = 0, players = []; 

        for (let player of await this.players) {
            try {
                let user = await player.user;
                if (user !== undefined) {
                    players.push({ name: `Игрок #${i + 1}`, value: `@${user.showname}`, inline: true });
                    i++;
                }
            } catch (err) { console.error(err) }
        }



        let embed = new EmbedBuilder()
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setTitle(`${game.name_ru}: ${game.description}`)
            .setAuthor({ name: `${creator.showname} создал новое лобби`, iconURL: `${creator.avatar_url}` });
        
        
        if (players.length > 0 && players.length <= config.maxEmbedFields) embed.addFields(players);
        else if (players.length > config.maxEmbedFields) {
            let wordForm = 'человек';
            let peopleLeft = players.slice(config.maxEmbedFields).length; 

            if (
                (String(peopleLeft).endsWith('2') && !String(peopleLeft).endsWith('12'))
                || (String(peopleLeft).endsWith('3') && !String(peopleLeft).endsWith('13'))
                || (String(peopleLeft).endsWith('4') && !String(peopleLeft).endsWith('14'))
            ) wordForm = 'человека';

            embed.addFields(players.slice(0, config.maxEmbedFields).concat([{ name: `...и остальные.`, value: `ещё ${peopleLeft} ${wordForm}!`, inline: true }]));
        }

        embed = embed
            .setTimestamp()
            .setFooter({ text: `Приглашение в лобби #${this.id}` });


        const start = new ButtonBuilder()
            .setLabel('начать')
            .setStyle(ButtonStyle.Success)
            .setCustomId(JSON.stringify({ type: Application.BUTTON_INTERACTION_TYPE.GAME, action: Games.ACTION_TYPE.START, lobby: this.id }));

        const confirm = new ButtonBuilder()
            .setLabel('присоединиться')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(JSON.stringify({ type: Application.BUTTON_INTERACTION_TYPE.GAME, action: Games.ACTION_TYPE.JOIN, lobby: this.id }));

        const cancel = new ButtonBuilder()
            .setLabel('отказаться')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(JSON.stringify({ type: Application.BUTTON_INTERACTION_TYPE.GAME, action: Games.ACTION_TYPE.DECLINE, lobby: this.id }));

        console.log(limit);

        const row = new ActionRowBuilder();
        if (players.length >= limit.min) row.addComponents(start);
        if (players.length < limit.max) row.addComponents(confirm);
        row.addComponents(cancel);

        return {
            embeds: [embed],
            components: [row as any]
        }
    }
}
