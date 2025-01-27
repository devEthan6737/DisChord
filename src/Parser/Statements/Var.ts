import { Token } from "../Types/types";
import { consume } from "../Utils/Consume";
import { peek } from "../Utils/Peek";
import { processValue } from "../Utils/Values";
import VarsInstance from "../Utils/Vars";

export function parseVar(tokens: Token[]) {
    const varName = consume(tokens, peek(tokens).type);

    if(peek(tokens).type != "IGUAL") throw new Error("Se esperaba la palabra reservada 'IGUAL' después del nombre de la variable.");
    else consume(tokens, "IGUAL");

    const varValue = consume(tokens, peek(tokens).type);

    VarsInstance.addVar(varName.value, processValue(varValue));
}