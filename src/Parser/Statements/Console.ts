import { Token, ASTNode } from "../Types/types";
import { consume } from "../Utils/Consume";
import { processValue } from "../Utils/Values";

export function parseConsole(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, ["TEXTO", "NUMERO", "BOOL", "LISTA", "INDEFINIDO", "NULO", "BIGINT"]);
    const value = processValue(valueToken); // Procesa el valor para obtener su tipo real

    return {
        type: "CONSOLA",
        value,
    };
}