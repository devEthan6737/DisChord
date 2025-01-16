// @ts-nocheck

type Token = {
    type: string;
    value: string;
};

export class Lexer {
    private keywords = require('./keywords');
    private symbols = require('./symbols');

    constructor(private input: string) {}

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        let current = 0;

        while (current < this.input.length) {
            let char = this.input[current];

            if (/\s/.test(char)) { // Espacios en blanco
                current++;
                continue;
            }

            if (char === "/") {
                char = this.input[++current]; // Avanza al siguiente carácter
                if (char === "/") {
                    while (char !== "\n" && current < this.input.length) {
                        char = this.input[++current];
                    }
                    continue;
                } else if (char === "*") {
                    char = this.input[++current];
                    while (current < this.input.length) {
                        if (char === "*" && this.input[current + 1] === "/") {
                            current += 2;
                            break;
                        }
                        char = this.input[++current];
                    }
                    continue;
                }

                throw new Error(`Token inesperado: ${char}`);
            }

            if (char === '"') { // Strings
                let value = "";
                char = this.input[++current];
                while (char !== '"' && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                current++;
                tokens.push({ type: "STRING", value });
                continue;
            }

            if (char === "[") { // Arrays
                let value = "[";
                char = this.input[++current];
                while (char !== "]" && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                value += ']';
                current++;
                tokens.push({ type: "ARRAY", value });
                continue;
            }

            if (/[0-9]/.test(char)) { // Números
                let value = "";
                while (/[0-9.]/.test(char) && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                tokens.push({ type: "NUMBER", value });
                continue;
            }

            if (/[a-zA-Z]/.test(char)) { // Keywords, identificadores, booleanos, undefined
                let value = "";
                while (/[a-zA-Z]/.test(char) && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                if (this.keywords.includes(value)) {
                    tokens.push({ type: value.toUpperCase(), value });
                } else if (["true", "false", "undefined"].includes(value)) {
                    tokens.push({ type: "LITERAL", value });
                } else {
                    tokens.push({ type: "IDENTIFIER", value });
                }
                continue;
            }

            if (this.symbols[char]) { // Símbolos
                tokens.push({ type: this.symbols[char], value: char });
                current++;
                continue;
            }

            throw new Error(`Token inesperado: ${char}`);
        }

        return tokens;
    }
}
