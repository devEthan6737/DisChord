import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";

export function parseCommand(tokens: Token[]): ASTNode {
    consume(tokens, "COMANDO");
    const name = consume(tokens, "TEXTO");
    const body = parseBlock(tokens);

    return {
        type: "COMANDO",
        value: name.value,
        children: body,
    };
}