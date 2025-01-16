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

            if (/[a-zA-Z]/.test(char)) { // Keywords e identificadores
                let value = "";
                while (/[a-zA-Z]/.test(char) && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                if (this.keywords.includes(value)) {
                    tokens.push({ type: value, value });
                } else {
                    tokens.push({ type: "IDENTIFIER", value });
                }
                continue;
            }

            if (this.symbols[char]) { // Symbols
                tokens.push({ type: this.symbols[char], value: char });
                current++;
                continue;
            }

            throw new Error(`Token inesperado: ${char}`);
        }

        return tokens;
    }
}
