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

    // Guardar estado ORIGINAL de las variables
    const originalVars = VarsInstance.getVars(); // Guardar estado de las variables originales
    const tempVars = { ...originalVars }; // Crear una copia de las variables originales

    funcData.params.forEach((param: string, index: number) => { // Inyectar parámetros en la copia
        tempVars[param] = args[index];
    });

    VarsInstance.setVars(tempVars); // Usar la copia como variables globales temporalmente
    StateInstance.setCurrent(0); // Establecer a 0 el estado de la instancia.

    const parser = new Parser(block);
    const nodes: ASTNode[] = parser.parse();

    VarsInstance.setVars(originalVars); // Restaurar variables originales.
    StateInstance.setCurrent(startIndex); // Restaurar el estado de la instancia.

    return nodes;
}
