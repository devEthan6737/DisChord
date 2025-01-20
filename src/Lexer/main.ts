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

            if (char === '"') { // Simple Strings
                let value = "";
                char = this.input[++current];
                while (char !== '"' && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                current++;
                tokens.push({ type: "TEXTO", value });
                continue;
            }

            if (char === '`') { // Template Strings
                let value = "";
                char = this.input[++current];
                while (char !== '`' && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                current++;
                tokens.push({ type: "TEXTO", value });
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
                tokens.push({ type: "LISTA", value });
                continue;
            }

            if (/[0-9]/.test(char) || char === "0") { // Números y BigInt
                let value = "";
            
                if (char === "0" && /[bBoOxX]/.test(this.input[current + 1])) { // bin, oct, hex
                    value += char;
                    char = this.input[++current];
                    value += char;
                    char = this.input[++current];
            
                    while (/[0-9a-fA-F]/.test(char) && current < this.input.length) {
                        value += char;
                        char = this.input[++current];
                    }
                } else {
                    while (/[0-9]/.test(char) && current < this.input.length) { // Números normales (decimal)
                        value += char;
                        char = this.input[++current];
                    }
                }
            
                if (char === "n") {
                    value += char;
                    char = this.input[++current];
                }
            
                // Asegúrate de agregar todo como un único token si es BIGINT
                if (/^[0-9]+n$/.test(value) || /^0[bBoOxX][0-9a-fA-F]+n$/.test(value)) {
                    tokens.push({ type: "BIGINT", value });
                } else {
                    tokens.push({ type: "NUMERO", value });
                }
            
                continue;
            }
            

            if (char === "<") { // Inicio de una expresión
                let value = "<";
                char = this.input[++current];
                while (char !== ">" && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                value += ">";
                current++;
                tokens.push({ type: "EXPRESION", value });
                continue;
            }

            if (/[a-zA-Z]/.test(char)) { // Keywords, identificadores, booleanos, undefined, null
                let value = "";
                while (/[a-zA-Z]/.test(char) && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }
                if (this.keywords.includes(value)) {
                    tokens.push({ type: value.toUpperCase(), value });
                } else if (value === 'indefinido') {
                    tokens.push({ type: "INDEFINIDO", value });
                } else if (value === 'nulo') {
                    tokens.push({ type: "NULO", value });
                } else if (["verdadero", "falso", "indefinido", "nulo"].includes(value)) {
                    tokens.push({ type: "BOOL", value });
                } else {
                    tokens.push({ type: value, value });
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
