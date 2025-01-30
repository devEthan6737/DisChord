import { ASTNode, Token } from "../Types/types";
import { parseExpression } from "../Utils/Expressions";
import { peek } from "../Utils/Peek";

export function parseReturn(tokens: Token[]): ASTNode | undefined {
    if (peek(tokens).type === 'EXPRESION') {
        return parseExpression(tokens);
    } else return;
}