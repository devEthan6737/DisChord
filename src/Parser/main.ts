// @ts-nocheck

import { Token, ASTNode } from './Types/types';
import { consume } from './Utils/Consume';
import { peek } from './Utils/Peek';
import { parseBot } from './Statements/Bot';
import { parseConsole } from './Statements/Console';

export class Parser {
    private current = 0;

    constructor(private tokens: Token[]) {}

    public parse(): ASTNode[] {
        const nodes: ASTNode[] = [];
    
        while (this.current < this.tokens.length) {
            switch (peek(this.tokens, this.current).type) {
                case "BOT":
                    consume(this.tokens, this.current, "BOT");
                    nodes.push(parseBot(this.tokens, this.current));
                    break;
                case "CONSOLA":
                    consume(this.tokens, this.current, "CONSOLA");
                    nodes.push(parseConsole(this.tokens, this.current));
                    break;
                default:
                    throw new Error(`${peek(this.tokens, this.current).type} no es una palabra reservada o no pertenece a este bloque.`);
            }
        }

        return nodes;
    }
}
