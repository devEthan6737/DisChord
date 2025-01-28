import { Lexer } from "../../Lexer/main";
import { Parser } from "../main";
import { ASTNode, Token } from "../Types/types";
import { parseBlockWithoutExecute } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import { parseExpression } from "../Utils/Expressions";
import StateInstance from "../Utils/State";
import { processValue } from "../Utils/Values";
import VarsInstance from "../Utils/Vars";

export function parseWhile(tokens: Token[]): ASTNode[] {
    const expression = consume(tokens, "EXPRESION");
    const block: any = parseBlockWithoutExecute(tokens);
    const nodes: ASTNode[] = [];
    const startIndex = StateInstance.current;
    const parser = new Parser(block);

    while (parseExpression(processValue(expression)).value === 'verdadero') {
        StateInstance.setCurrent(0);
        const body = parser.parse();
        const bodyProcessed = processBody(body);

        if(bodyProcessed === "SALTAR") continue;

        nodes.push(...body);

        if(bodyProcessed === "PARAR") break;
    }

    StateInstance.setCurrent(startIndex);

    return nodes;
}

export function parseEach(tokens: Token[]): ASTNode[] {
    const expression = consume(tokens, "EXPRESION");
    const startIndex = StateInstance.current;
    const expressioned = expression.value.split(';').map(i => {
        i = i.trim();
        if(!i.startsWith('<')) i = '<' + i;
        if(!i.endsWith('>')) i += '>';

        return i;
    });

    StateInstance.setCurrent(0);
    const lexer = new Lexer(expressioned[0].slice(1, -1)).tokenize();
    let parser = new Parser(lexer);
    parser.parse();
    StateInstance.setCurrent(startIndex);

    const varName = lexer[1].value;
    const block: any = parseBlockWithoutExecute(tokens);
    const nodes: ASTNode[] = [];
    parser = new Parser(block);

    while (processValue(parseExpression(expressioned[1])) === 'verdadero') {
        StateInstance.setCurrent(0);
    
        const body = parser.parse();
        const bodyProcessed = processBody(body);
    
        if (bodyProcessed === "SALTAR") {
            VarsInstance.addVar(varName, processValue(parseExpression(expressioned[2])));
            continue;
        }
    
        nodes.push(...body);
    
        if (bodyProcessed === "PARAR") break;
    
        VarsInstance.addVar(varName, processValue(parseExpression(expressioned[2])));
    }
    

    StateInstance.setCurrent(StateInstance.current + block.length + 2);

    return nodes;
}

function processBody(body: ASTNode[]): string | boolean {
    for (let node of body) {
        if (node.type === "PARAR") return "PARAR";
        if (node.type === "SALTAR") return "SALTAR";
        if (node.children && node.children.length > 0) {
            const result = processBody(node.children);
            if (result === "PARAR") return "PARAR";
            if (result === "SALTAR") return "SALTAR";
        }
    }
    return false;
}
