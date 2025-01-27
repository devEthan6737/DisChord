import { Token, ASTNode } from "../Types/types";
import { parseBlock, parseBlockWithoutExecute } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { parseExpression } from "../Utils/Expressions";
import { peek } from "../Utils/Peek";
import StateInstance from "../Utils/State";
import { processValue } from "../Utils/Values";

export function parseCondition(tokens: Token[]): ASTNode {
    const valueToken = consume(tokens, "EXPRESION");
    let value = parseExpression(processValue(valueToken)).value;
    let body: any = parseBlock(tokens);

    while (tokens[StateInstance.current] && peek(tokens).type === 'ADEMAS') {
        consume(tokens, 'ADEMAS');

        if(value === 'falso') {
            let valueToken = consume(tokens, 'EXPRESION');
            value = parseExpression(processValue(valueToken)).value;
            let conditionParsed = parseBlock(tokens);

            body = conditionParsed
        } else {
            consume(tokens, 'EXPRESION');
            parseBlockWithoutExecute(tokens);
        }
    }

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