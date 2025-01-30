import { Token, ASTNode } from './Types/types';
import { consume } from './Utils/Consume';
import { peek } from './Utils/Peek';
import { parseBot } from './Statements/Bot';
import { parseConsole } from './Statements/Console';
import StateInstance from './Utils/State';
import { parseType } from './Statements/Type';
import { parseCondition } from './Statements/Conditions';
import { parseExpression } from './Utils/Expressions';
import { parseVar } from './Statements/Var';
import { parseEach, parseWhile } from './Statements/Loops';
import { executeFunction, parseFunction } from './Statements/Function';
import VarsInstance from './Utils/Vars';
import FunctionInstance from './Utils/Functions';
import { Lexer } from '../Lexer/main';
import { processValue } from './Utils/Values';
import { parseReturn } from './Statements/Returns';

export class Parser {
    constructor(private tokens: Token[]) {}

    public parse(): ASTNode[] {
        let nodes: ASTNode[] = [];

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
                case "VAR":
                    consume(this.tokens, "VAR");
                    const _var = parseVar(this.tokens);
                    if(Array.isArray(_var) && _var.length > 0) nodes = nodes.concat(_var);
                    break;
                case "MIENTRAS":
                    consume(this.tokens, "MIENTRAS");
                    nodes = nodes.concat(parseWhile(this.tokens));
                    break;
                case "CADA":
                    consume(this.tokens, "CADA");
                    nodes = nodes.concat(parseEach(this.tokens));
                    break;
                case "PARAR":
                    nodes.push(consume(this.tokens, "PARAR"));
                    return nodes;
                case "SALTAR":
                    nodes.push(consume(this.tokens, "SALTAR"));
                    break;
                case "FUNCION":
                    consume(this.tokens, "FUNCION");
                    nodes.push(parseFunction(this.tokens));
                    break;
                case "DEVOLVER":
                    consume(this.tokens, "DEVOLVER");
                    const parsed: any = parseReturn(this.tokens);
                    // return parsed? parsed : [];
                    nodes.push(parsed);
                    break;

                case "EXPRESION":
                    nodes.push(parseExpression(this.tokens));
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
                case "LISTA":
                    consume(this.tokens, "LISTA");
                    break;
                case "INDEFINIDO":
                    consume(this.tokens, "INDEFINIDO");
                    break;
                case "NULO":
                    consume(this.tokens, "NULO");
                    break;

                default:
                    const CurrentToken = peek(this.tokens);
                    if (VarsInstance.hasVar(CurrentToken.type)) {
                        consume(this.tokens, CurrentToken.type);
                        break;
                    }else if(FunctionInstance.hasFunction(CurrentToken.type)) {
                        consume(this.tokens, CurrentToken.type);
                        const expression = consume(this.tokens, 'EXPRESION');
                        const args = new Lexer(expression.value.split(';').join('')).tokenize();
                        nodes = nodes.concat(executeFunction(CurrentToken.type, args.map(param => processValue(param))));
                        break;
                    }

                    throw new Error(`${peek(this.tokens).type} no es una palabra reservada o no pertenece a este bloque.`);
            }
        }

        return nodes;
    }
}