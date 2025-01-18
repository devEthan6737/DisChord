import { Token, ASTNode } from "../Types/types";
import { parseBlock } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { match } from "../Utils/Match";

export function parseCondition(tokens: Token[], current: number): ASTNode {
    consume(tokens, current,  "SI");
    const condition = consume(tokens, current, "IDENTIFIER");
    const body = parseBlock(tokens, current);

    const node: ASTNode = {
        type: "Condition",
        value: condition.value,
        children: body,
    };

    if (match(tokens, current, "SINO")) {
        consume(tokens, current, "SINO");
        node.children!.push({
            type: "Else",
            children: parseBlock(tokens, current),
        });
    }

    return node;
}