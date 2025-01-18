import { parseCommand } from "../Statements/Command";
import { parseCondition } from "../Statements/Conditions";
import { parseConsole } from "../Statements/Console";
import { parseReply } from "../Statements/Reply";
import { Token, ASTNode } from "../Types/types";
import { consume } from "./Consume";
import { match } from "./Match";
import { peek } from "./Peek";

export function parseBlock(tokens: Token[]): ASTNode[] {
    consume(tokens, "L_BRACE");

    const children: ASTNode[] = [];
    while (!match(tokens, "R_BRACE")) {
        switch (peek(tokens).type) {
            case "COMANDO":
                children.push(parseCommand(tokens));
                break;
            case "SI":
                children.push(parseCondition(tokens));
                break;
            case "RESPONDER":
                children.push(parseReply(tokens));
                break;
            case "CONSOLA":
                consume(tokens, "CONSOLA");
                parseConsole(tokens);
                break;
            default:
                throw new Error(`Token inesperado: ${peek(tokens).type}`);
        }
    }

    consume(tokens, "R_BRACE");
    return children;
}