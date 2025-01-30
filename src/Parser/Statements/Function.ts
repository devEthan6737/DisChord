import { Parser } from "../main";
import { ASTNode, Token } from "../Types/types";
import { parseBlockWithoutExecute } from "../Utils/Blocks";
import { consume } from "../Utils/Consume";
import FunctionInstance from "../Utils/Functions";
import { peek } from "../Utils/Peek";
import StateInstance from "../Utils/State";
import VarsInstance from "../Utils/Vars";

export function parseFunction(tokens: Token[]): ASTNode {
    const name = consume(tokens, peek(tokens).type).value;
    const paramsToken = consume(tokens, "EXPRESION").value;
    const params = paramsToken.split(";").map(param => param.trim());
    const block = parseBlockWithoutExecute(tokens);

    FunctionInstance.addFunction(name, { params, block });

    return {
        type: "FUNCION",
        value: name
    };
}

export function executeFunction(name: string, args: string[]): ASTNode[] {
    const startIndex = StateInstance.current;
    const funcData = FunctionInstance.getFunction(name);

    if (!funcData) throw new Error(`La función "${name}" no está definida.`);

    const { params, block } : any = funcData;

    if (params.length !== args.length) throw new Error(`La función "${name}" espera ${params.length} parámetros, pero recibió ${args.length}.`);

    params.forEach((param: any, index: any) => {
        VarsInstance.addVar(param, args[index]);
    });

    StateInstance.setCurrent(0);

    const parser = new Parser(block);
    const nodes: ASTNode[] = parser.parse();

    StateInstance.setCurrent(startIndex);

    return nodes;
}
