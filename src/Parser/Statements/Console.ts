import { Token, ASTNode } from "../Types/types";
import { consume } from "../Utils/Consume";
import { params } from "../Utils/Params";
import { processValue } from "../Utils/Values";

export function parseConsole(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, ["TEXTO", "NUMERO", "BOOL", "LISTA", "INDEFINIDO", "NULO", "BIGINT", "EXPRESION"]);
    const value = processValue(valueToken); // Procesa el valor para obtener su tipo real

    if(valueToken.type === 'EXPRESION') {
        const expression: Token = params(value);
        return {
            type: 'CONSOLA',
            value: expression.type === expression.value? expression.value : processValue(expression)
        }
    }else return {
        type: "CONSOLA",
        value,
    };
}