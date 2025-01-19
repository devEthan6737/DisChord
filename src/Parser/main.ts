import { Token, ASTNode } from './Types/types';
import { consume } from './Utils/Consume';
import { peek } from './Utils/Peek';
import { parseBot } from './Statements/Bot';
import { parseConsole } from './Statements/Console';
import StateInstance from './Utils/State';
import { parseType } from './Statements/Type';

export class Parser {
    constructor(private tokens: Token[]) {}

    public parse(): ASTNode[] {
        const nodes: ASTNode[] = [];

        while (StateInstance.current < this.tokens.length) {
            switch (peek(this.tokens).type) {
                case "BOT":
                    consume(this.tokens, "BOT");
                    nodes.push(parseBot(this.tokens));
                    break;
                case "CONSOLA":
                    consume(this.tokens, "CONSOLA");
                    nodes.push(parseConsole(this.tokens));
                    break;
                case "TIPO":
                    consume(this.tokens, "TIPO");
                    nodes.push(parseType(this.tokens));
                    break;
                default:
                    throw new Error(`${peek(this.tokens).type} no es una palabra reservada o no pertenece a este bloque.`);
            }
        }

        return nodes;
    }
}
