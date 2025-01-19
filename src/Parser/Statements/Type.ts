import { Token, ASTNode } from "../Types/types";
import { consume } from "../Utils/Consume";

export function parseType(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, ["TEXTO", "NUMERO", "BOOL", "LISTA", "INDEFINIDO", "NULO", "BIGINT"]);

    return {
        type: "TIPO",
        value: valueToken.type,
    };
}