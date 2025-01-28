import { Parser } from "../main";
import { ASTNode, Token } from "../Types/types";
import { parseBlockWithoutExecute } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { parseExpression } from "../Utils/Expressions";
import StateInstance from "../Utils/State";
import { processValue } from "../Utils/Values";

export function parseWhile(tokens: Token[]): ASTNode[] {
    const expression = consume(tokens, "EXPRESION");
    const block: any = parseBlockWithoutExecute(tokens);
    const nodes: ASTNode[] = [];
    const startIndex = StateInstance.current;
    const parser = new Parser(block);

    while (parseExpression(processValue(expression)).value === 'verdadero') {
        StateInstance.setCurrent(0);
        const body = parser.parse();
        // console.log(body);
        nodes.push(...body);
    }

    StateInstance.setCurrent(startIndex);

    return nodes;
}