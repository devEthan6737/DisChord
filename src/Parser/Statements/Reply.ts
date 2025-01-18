import { Token, ASTNode } from "../Types/types";
import { consume } from "../Utils/Consume";

export function parseReply(tokens: Token[], current: number): ASTNode {
    consume(tokens, current, "RESPONDER");
    const name = consume(tokens, current, "STRING");

    return {
        type: "RESPONDER",
        value: name.value,
    };
}