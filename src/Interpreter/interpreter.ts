import { Lexer } from "../Lexer/main";
import { Parser } from "../Parser/main";
import * as fs from "fs";
import path from "path";

const code = fs.readFileSync(path.join(__dirname, "../../index.chord"), "utf-8");
const lexer = new Lexer(code);
const parser = new Parser(lexer.tokenize());

function executeAST(ast: any) {
    console.log(JSON.stringify(ast))

    let current = 0;
    while (current < ast.length) {
        let peek = ast[current];

        if (peek.type === 'CONSOLA') {
            console.log(peek.value);
        } else if (peek.children) {
            executeAST( peek.children );
        }

        current++;
    }
};

executeAST(parser.parse());