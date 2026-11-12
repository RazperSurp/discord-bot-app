import { GuildMember } from "discord.js";
import BaseTable from "./BaseTable.ts";

export default class Users extends BaseTable {
    actualize(member: GuildMember) {
        this.username = member.user.username;
        this.showname = member.displayName;

        if (member.user.avatar != this.avatar_hash) {
            this.avatar_hash = member.user.avatar;
            this.avatar_url = member.displayAvatarURL();
        }
    }
}
