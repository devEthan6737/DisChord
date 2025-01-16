import { Lexer } from "./Lexer/main";
import { Parser } from "./Parser/main";
import * as fs from "fs";
import path from "path";

const code = fs.readFileSync(path.join(__dirname, "../index.chord"), "utf-8");
const lexer = new Lexer(code);
// console.log(lexer.tokenize())
const parser = new Parser(lexer.tokenize());
console.log(parser.parse());