import { Token, ASTNode } from "../Types/types";
import { consume } from "../Utils/Consume";

export function parseReply(tokens: Token[]): ASTNode {
    consume(tokens, "RESPONDER");
    const name = consume(tokens, "TEXTO")

    return {
        type: "RESPONDER",
        value: name.value,
    };
}