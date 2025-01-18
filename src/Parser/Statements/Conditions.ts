import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { match } from "../Utils/Match";

export function parseCondition(tokens: Token[]): ASTNode {
    consume(tokens,  "SI");
    const condition = consume(tokens, "IDENTIFIER");
    const body = parseBlock(tokens);

    const node: ASTNode = {
        type: "Condition",
        value: condition.value,
        children: body,
    };

    if (match(tokens, "SINO")) {
        consume(tokens, "SINO");
        node.children!.push({
            type: "Else",
            children: parseBlock(tokens),
        });
    }

    return node;
}