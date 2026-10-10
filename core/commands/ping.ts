import BaseCommand from './BaseCommand';
import { PassedArgumentsList } from "./BaseCommand";

export default class Ping extends BaseCommand {
    _do(namedArgs: PassedArgumentsList): any {
        return 'pong';
    }
}