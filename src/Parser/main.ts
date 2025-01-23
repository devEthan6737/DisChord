import { Token, ASTNode } from './Types/types';
import { consume } from './Utils/Consume';
import { peek } from './Utils/Peek';
import { parseBot } from './Statements/Bot';
import { parseConsole } from './Statements/Console';
import StateInstance from './Utils/State';
import { parseType } from './Statements/Type';
import { parseCondition } from './Statements/Conditions';

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
                case "SI":
                    consume(this.tokens, "SI");
                    nodes.push(parseCondition(this.tokens));
                    break;

                case "NUMERO":
                    consume(this.tokens, "NUMERO");
                    break;
                case "TEXTO":
                    consume(this.tokens, "TEXTO");
                    break;
                case "BOOL":
                    consume(this.tokens, "BOOL");
                    break;
                case "INDEFINIDO":
                    consume(this.tokens, "INDEFINIDO");
                    break;
                case "NULO":
                    consume(this.tokens, "NULO");
                    break;

                default:
                    throw new Error(`${peek(this.tokens).type} no es una palabra reservada o no pertenece a este bloque.`);
            }
        }
    
        return nodes;
    }
}