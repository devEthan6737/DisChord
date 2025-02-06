import { ASTNode, Token } from "src/Types/Token";
import { comparation_operators, operators, statements, types } from "../Lexer/types"

export class Parser {
    public nodes: ASTNode[] = [];
    private functions: string[] = [];

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
                case statements.SI:
                    this.consume(statements.SI);
                    const conditionExpression: any = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);
                    let block: any = this.blocks(statements.L_BRACE, statements.R_BRACE);
                    let elseIf: any = [];
                    let elseBlock: any;

                    if(this.current < this.tokens.length) {
                        while (this.peek().type === statements.ADEMAS) {
                            this.consume(statements.ADEMAS);
                            this.consume(statements.SI);
                            const elseIfCondition = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);
                            const elseIfBlock = this.blocks(statements.L_BRACE, statements.R_BRACE);
                            elseIf.push({ value: elseIfCondition, children: elseIfBlock });
                        }

                        if (this.peek().type === statements.SINO) {
                            this.consume(statements.SINO);
                            elseBlock = this.blocks(statements.L_BRACE, statements.R_BRACE);
                        }
                    }

                    this.nodes.push(
                        {
                            type: "SI",
                            value: conditionExpression,
                            children: block,
                            elseif: elseIf,
                            else: elseBlock
                        }
                    );
                    break;
                case statements.VAR:
                    this.consume(statements.VAR);
                    const varName: any = this.consume(this.peek().type);
                    this.consume(comparation_operators.IGUAL);
                    let content: any;

                    if (this.peek().type === statements.L_EXPRESSION) {
                        content = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);
                    } else {
                        content = this.consume(this.peek().type);
                    }

                    this.nodes.push(
                        {
                            type: "VAR",
                            value: varName.value,
                            content: content
                        }
                    );
                    break;
                case statements.MIENTRAS:
                case statements.CADA:
                    const statementType = this.consume(this.peek().type);
                    const condition: any = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);
                    const body: any = this.blocks(statements.L_BRACE, statements.R_BRACE);

                    this.nodes.push(
                        {
                            type: statementType.type,
                            value: condition,
                            children: body
                        }
                    );

                    break;
                case statements.SEPARADOR:
                    this.consume(statements.SEPARADOR);
                    break;

                case statements.FUNCION:
                    this.consume(statements.FUNCION);
                    const functionName: any = this.consume(this.peek().type);
                    const params: any = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);
                    const funcBody: any = this.blocks(statements.L_BRACE, statements.R_BRACE);

                    this.functions.push(functionName);

                    this.nodes.push(
                        {
                            type: statements.FUNCION,
                            value: functionName.type,
                            children: [ params, funcBody ]
                        }
                    );
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
                case comparation_operators.O:
                case comparation_operators.Y:
                    this.parseOperator(this.peek().type);
                    break;

                case statements.DEVOLVER:
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
                    // Consumir funciones, en caso contrario simplemente se consume y se agrega el nodo.
                    if (this.peek().type && this.current + 1 < this.tokens.length && this.tokens[this.current + 1].type === statements.L_EXPRESSION) {
                        const functionName: any = this.consume(this.peek().type);

                        if (!this.functions.some((fn: any) => fn.value === functionName.value)) throw new Error(`La función ${functionName.value} no ha sido declarada.`); // Verificar que la función se declaró
                        const params: any = this.blocks(statements.L_EXPRESSION, statements.R_EXPRESSION);

                        this.nodes.push({
                            type: functionName.value,
                            value: params?.length > 0 ? params : []
                        });
                    } else this.nodes.push(this.consume(this.peek().type)); // Consumir token normal
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
        if (operator === 'NO') {
            this.consume('NO');
            let value: any;
    
            if (this.peek().type === 'L_EXPRESSION') {
                value = this.blocks('L_EXPRESSION', 'R_EXPRESSION');
            } else {
                value = this.consume(this.peek().type);
            }
    
            this.nodes.push({
                type: 'NO',
                value: value
            });

            return;
        }

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