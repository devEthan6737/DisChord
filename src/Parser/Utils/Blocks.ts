// @ts-nocheck

import { parseCommand } from "../Statements/Command";
import { parseCondition } from "../Statements/Conditions";
import { parseConsole } from "../Statements/Console";
import { parseReply } from "../Statements/Reply";
import { Token, ASTNode } from "../Types/types";
import { consume } from "./Consume";
import { match } from "./Match";
import { peek } from "./Peek";

export function parseBlock(tokens: Token[], current: number): ASTNode[] {
    consume(tokens, current, "L_BRACE");

    const children: ASTNode[] = [];
    while (!match(tokens, current, "R_BRACE")) {
        switch (peek(tokens, current).type) {
            case "COMANDO":
                children.push(parseCommand(tokens, current));
                break;
            case "SI":
                children.push(parseCondition(tokens, current));
                break;
            case "RESPONDER":
                children.push(parseReply(tokens, current));
                break;
            case "CONSOLA":
                consume(tokens, current, "CONSOLA");
                parseConsole(tokens, current);
                break;
            default:
                throw new Error(`Token inesperado: ${peek(tokens, current).type}`);
        }
    }

    consume(tokens, current, "R_BRACE");
    return children;
}