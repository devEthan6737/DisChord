import { ASTNode, Token } from "src/Types/Token";
import { comparation_operators, operators, statements, types } from "../Lexer/types"

export class Parser {
    public nodes: ASTNode[] = [];

    constructor(private tokens: Token[], private current: number = 0) {}

    public parse(): ASTNode[] {

        while (this.current < this.tokens.length) {
            switch (this.peek().type) {
                case statements.CONSOLA:
                    this.consume("CONSOLA");

                    if(this.peek().type === 'L_EXPRESSION') {
                        let expressionArray = this.blocks('L_EXPRESSION', 'R_EXPRESSION');
                        this.nodes.push(
                            {
                                type: "CONSOLA",
                                value: 'EXPRESION',
                                children: expressionArray
                            }
                        );
                    }else this.nodes.push(
                        {
                            type: "CONSOLA",
                            value: 'EXPRESION',
                            children: [ this.consume(types) ]
                        }
                    );

                    break;
                case statements.TIPO:
                    this.consume("TIPO");

                    if(this.peek().type === 'L_EXPRESSION') {
                        let expressionArray = this.blocks('L_EXPRESSION', 'R_EXPRESSION');
                        this.nodes.push(
                            {
                                type: "TIPO",
                                value: 'EXPRESION',
                                children: expressionArray
                            }
                        );
                    }else this.nodes.push(
                        {
                            type: "TIPO",
                            value: 'EXPRESION',
                            children: [ this.consume(types) ]
                        }
                    );

                    break;
                case statements.L_EXPRESSION:
                    const expression: any = this.blocks('L_EXPRESSION', 'R_EXPRESSION');
                    
                    this.nodes.push(expression);
                    break;

                case operators.MAS:
                case operators.MENOS:
                case operators.POR:
                case operators.ENTRE:
                case operators.EXP:
                case operators.RESTO:
                
                case comparation_operators.IGUAL:
                case comparation_operators.IGUAL_TIPADO:
                case comparation_operators.MAYOR:
                case comparation_operators.MAYOR_IGUAL:
                case comparation_operators.MENOR:
                case comparation_operators.MENOR_IGUAL:
                case comparation_operators.NO:
                    this.parseOperator(this.peek().type);
                    break;

                case "NUMERO":
                case "BIGINT":
                case "BOOL":
                case "TEXTO":
                case "LISTA":
                case "NULO":
                case "INDEFINIDO":
                    this.nodes.push(this.consume(this.peek().type));
                    break;

                default:
                    throw new Error(`${this.peek().type} no es una palabra reservada o no pertenece a este bloque.`);
            }
        }

        return this.nodes;
    }

    private peek(): Token {
        if (this.current >= this.tokens.length) throw new Error("Se acabaron los tokens");
        return this.tokens[this.current];
    }

    private consume(expectedTypes: any): Token {
        const token = this.tokens[this.current];
        const expected = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];

        if (!expected.includes(token.type)) throw new Error(`Se esperaba uno de ${expected.join(', ')} pero se encontró ${token.type}`);

        return this.tokens[this.current++];
    }

    private blocks(openType: string, closeType: string) {
        let depth = 1; // Inicializar depth en 1 (ya estamos dentro de la expresión)
        let blockTokens = [];
        this.consume(openType); // Consumir el primer L_EXPRESSION
    
        while (this.current < this.tokens.length && depth > 0) {
            const token = this.tokens[this.current];
            
            if (token.type === openType) depth++;
            if (token.type === closeType) depth--;
    
            if (depth === 0) { // Fin del bloque principal
                this.current++; // Saltar el R_EXPRESSION de cierre
                break;
            }
    
            blockTokens.push(token); // Añadir tokens internos
            this.current++;
        }
    
        return new Parser(blockTokens).parse();
    }

    private parseOperator(operator: string) {
        // this.curret--;
        const left = this.nodes[this.nodes.length - 1];
        this.nodes.shift();
        this.consume(operator);
        let right;

        if(this.peek().type === 'L_EXPRESSION') right = this.blocks('L_EXPRESSION', 'R_EXPRESSION');
        else right = this.consume(this.peek().type);

        this.nodes.push(
            {
                type: operator,
                left: left,
                right: right
            }
        );
    }
}