// import BaseCommand from './BaseCommand.ts';
import BaseCommand from "./BaseCommand.ts";
// console.log(PassedArgumentsList)

// console.log()

export default class ping extends BaseCommand {
    _do(namedArgs: any): any {
        return 'pong';
    }
}