import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";

export function parseBot(tokens: Token[], current: number): ASTNode {
    const name = consume(tokens, current, "STRING");
    const body = parseBlock(tokens, current);

    return {
        type: "BOT",
        value: name.value,
        children: body,
    };
}