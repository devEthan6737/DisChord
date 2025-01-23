import { Token, ASTNode } from "../Types/types";
import { parseBlock, parseBlockWithoutExecute } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { peek } from "../Utils/Peek";
import StateInstance from "../Utils/State";
import { processValue } from "../Utils/Values";

export function parseCondition(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, "BOOL");
    let value = processValue(valueToken);
    let body: any = parseBlock(tokens);

    if (tokens[StateInstance.current] && peek(tokens).type === 'SINO') {
        consume(tokens, 'SINO');

        if(value === 'falso') {
            let conditionParsed = parseBlock(tokens);
            value = 'verdadero';
            body = conditionParsed;
        } else {
            parseBlockWithoutExecute(tokens);
        }
    }

    return {
        type: "CONDICION",
        value: value,
        children: value === 'verdadero'? body : []
    };
}