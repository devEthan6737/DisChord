import { Token } from "src/Parser/Types/types";

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

            if (char === "/") { // Comentarios
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
                    while ((/[0-9]/.test(char) || char === ".") && current < this.input.length) {
                        if (char === "." && value.includes(".")) { // Validar que no haya más de un punto decimal
                            throw new Error("Número inválido: múltiples puntos decimales.");
                        }
                        value += char;
                        char = this.input[++current];
                    }
                }

                if (char === "n") {
                    value += char;
                    char = this.input[++current];
                }

                // Asegurar de agregar todo como un único token si es BIGINT
                if (/^[0-9]+n$/.test(value) || /^0[bBoOxX][0-9a-fA-F]+n$/.test(value)) {
                    tokens.push({ type: "BIGINT", value });
                } else {
                    tokens.push({ type: "NUMERO", value });
                }

                continue;
            }

            if (char === "<") { 
                let expression = "";
                let depth = 1;
                char = this.input[++current];
                
                while (depth > 0 && current < this.input.length) {
                    if (char === "<") depth++;
                    if (char === ">") depth--;
                    if (depth > 0) expression += char;
                    char = this.input[++current];
                }

                if (depth !== 0) {
                    throw new Error("Expresión no cerrada con '>'");
                }

                tokens.push({ 
                    type: "EXPRESION", 
                    value: expression.trim() // Ej: "edad MAYOR_IGUAL 18"
                });
                continue;
            }

            if (/[a-zA-Z]/.test(char)) { // Keywords, identificadores, booleanos, undefined, null
                let value = "";
                while (/[a-zA-Z0-9_]/.test(char) && current < this.input.length) {
                    value += char;
                    char = this.input[++current];
                }

                if (this.keywords.includes(value)) {
                    tokens.push({ type: value.toUpperCase(), value });
                } else if (value === 'indefinido') {
                    tokens.push({ type: "INDEFINIDO", value });
                } else if (value === 'nulo') {
                    tokens.push({ type: "NULO", value });
                } else if (["verdadero", "falso" ].includes(value)) {
                    tokens.push({ type: "BOOL", value });
                } else if ([ "MAYOR", "MENOR", "MAYOR_IGUAL", "MENOR_IGUAL", "NO", "IGUAL_TIPADO", "IGUAL" ].includes(value)) {
                    tokens.push({ type: "COMPARADOR", value });
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
