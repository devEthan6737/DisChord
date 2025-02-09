import { executeAST } from "../Interpreter/interpreter";
import { Lexer } from "../Lexer/lexer";
import { Parser } from "../Parser/parser";

export function interpolateString(text: string): string {
    return text.replace(/{([^}]+)}/g, (exprStr) => {
        const tokens = new Lexer(exprStr).tokenize();
        const ast = new Parser(tokens).parse();
        const result = executeAST(ast);
        return result && result.value !== undefined ? result.value : String(result);
    });
}