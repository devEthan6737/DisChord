import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";

export function parseBot(tokens: Token[]): ASTNode {
    const name = consume(tokens, "TEXTO");
    const body = parseBlock(tokens);

    return {
        type: "BOT",
        value: name.value,
        children: body,
    };
}