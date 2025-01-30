import types from "../../Lexer/types";
import { Token } from "../Types/types";
import { consume } from "../Utils/Consume";
import { parseExpression } from "../Utils/Expressions";
import { peek } from "../Utils/Peek";
import { processValue } from "../Utils/Values";
import VarsInstance from "../Utils/Vars";

export function parseVar(tokens: Token[]): any {
    const varName = consume(tokens, peek(tokens).type);

    if (peek(tokens).type != "IGUAL") throw new Error("Se esperaba la palabra reservada 'IGUAL' después del nombre de la variable.");
    else consume(tokens, "IGUAL");

    const varValue = consume(tokens, peek(tokens).type);
    if (varValue.type === "EXPRESION") {
        const expression: any = parseExpression(varValue.value);
        if (Array.isArray(expression)) {
            const expressionFiltered = expression.filter((exp: any) => types.includes(exp.type));
            VarsInstance.addVar(varName.value, processValue(expressionFiltered[0]));

            if (expression.length > 1) return expression.filter((exp: any) => !types.includes(exp.type));
        } else {
            VarsInstance.addVar(varName.value, processValue(expression));
            return undefined;
        }
    } else {
        VarsInstance.addVar(varName.value, processValue(varValue));
        return undefined;
    }
}