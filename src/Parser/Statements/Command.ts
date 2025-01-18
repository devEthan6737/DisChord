import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";

export function parseCommand(tokens: Token[], current: number): ASTNode {
    consume(tokens, current, "COMANDO");
    const name = consume(tokens, current, "STRING");
    const body = parseBlock(tokens, current);

    return {
        type: "COMANDO",
        value: name.value,
        children: body,
    };
}