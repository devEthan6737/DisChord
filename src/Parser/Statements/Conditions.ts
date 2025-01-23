import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { processValue } from "../Utils/Values";

export function parseCondition(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, "BOOL");
    const value = processValue(valueToken);
    const body = parseBlock(tokens);

    return {
        type: "CONDICION",
        value: value,
        children: value === 'verdadero'? body : []
    };
}