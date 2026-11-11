import { ButtonInteraction } from "discord.js";
import { Application } from "../core.ts";
import BaseTable from "./BaseTable.ts";
import Configs from "./configs.ts";
import LobbiesStates from "./lobbies_states.ts";
import Players from "./players.ts";
import Users from "./users.ts";

export default class Lobbies extends BaseTable {
    _config: Configs;
    get config(): Configs { return this._config } 

    _states: LobbiesStates[];
    get states(): LobbiesStates[] { return this._states }
    get state(): LobbiesStates | undefined { return this.states.find(obj => obj.id === this.lobbies_states_id) }

    _players: Players[] = [];
    get players(): Players[] { return this._players; }
    set players(value) { this._players = value; }

    constructor(record: Record<string, any> | any | unknown, isExists = false, config: Configs | null = null, states: LobbiesStates[] | null = null, defaultState: LobbiesStates | null = null) {
        super(record, isExists);
        this._config = (config ?? Configs.getById(this.configs_id)) as Configs; 
        this._states = (states ?? LobbiesStates.getAllByWhere({ games_id: { value: this.config.games_id }})) as LobbiesStates[]; 
        this.lobbies_states_id = (defaultState?.id ?? LobbiesStates.gameDefaultState(this.config.games_id)) as number;
    }

    static new(user: Users, idGame: number): Promise<Lobbies> {
        return new Promise(async (resolve, reject) => {
            const states = await LobbiesStates.getAllByWhere({ games_id: { value: idGame } });
            const config = await Configs.getOneByWhere({ games_id: { value: idGame } });
            const defaultState = await LobbiesStates.gameDefaultState(idGame);

            console.log(config);

            let lobby = new this({ 
                creator_id: user.id,
                lobbies_states_id: states[0].id,
                configs_id : config.id
            }, false, config as Configs, states as LobbiesStates[], defaultState as LobbiesStates);

            await lobby.insert();

            lobby.addPlayer(user);
            resolve(lobby);
        })
    }

    static async join(user: Users, interaction: ButtonInteraction, id: number) {
        const lobby = await Lobbies.getById(id);
        if (!lobby) throw 404;
        else {
            await lobby.addPlayer(user);
            interaction.message.reply(`${interaction.member} присоединился`);
        } 
    } 

    static async decline(user: Users, interaction: ButtonInteraction, id: number) {
        const lobby = await Lobbies.getById(id);
        if (!lobby) throw 404;
        else {
            console.log(lobby);
            return interaction.message.reply(`${interaction.member} отказался. Знаете, есть такой мем: "У ТЕБЯ НОЖ В СПИНЕ!...  ..... ... мне похуй...."`);
        }
    } 

    async addPlayer(user: Users) {
        const state = Application.instance.db?.tables.players_states.getOneByWhere({ games_id: { value: this.config.games_id } })
        let player = await (new Players({
            users_id: user.id,
            lobbies_id: this.id,
            players_states_id: state.id
        })).insert();

        return player;
    }
}
