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
                
                const evaluateExpression = (expr: string): any => {
                    const tokens: string[] = [];
                    const tokenPattern = /(\d+|"(?:\\"|[^"])*"|<[^>]+>|[a-zA-Z]+|MAS|MENOS|POR|ENTRE|RESTO|EXP)/g;
                    let match;
                    
                    while ((match = tokenPattern.exec(expr)) !== null) {
                        tokens.push(match[0]);
                    }
                    
                    if (tokens.length === 0) {
                        throw new Error("Expresión vacía");
                    }
            
                    const parseOperand = (operand: string): any => {
                        if (operand.startsWith('<')) {
                            return evaluateExpression(operand.slice(1, -1).trim());
                        } else if (operand.startsWith('"')) {
                            return operand.slice(1, -1);
                        } else if (operand === 'ESPACIO') {
                            return ' ';
                        } else if (operand === 'INTRO') {  // <- Nueva condición para INTRO
                            return '\n';
                        } else if (['verdadero', 'falso'].includes(operand)) {
                            return operand === 'verdadero';
                        } else if (!isNaN(operand as any)) {
                            return parseFloat(operand);
                        } else {
                            throw new Error(`Operando desconocido: ${operand}`);
                        }
                    };                    
            
                    let result = parseOperand(tokens[0]);
                    
                    for (let i = 1; i < tokens.length; i += 2) {
                        const operator = tokens[i];
                        const right = parseOperand(tokens[i + 1]);
                        
                        switch (operator) {
                            case "MAS":
                                result = result + right;
                                break;
                            case "MENOS":
                                result = result - right;
                                break;
                            case "POR":
                                result = result * right;
                                break;
                            case "ENTRE":
                                result = result / right;
                                break;
                            case "RESTO":
                                result = result % right;
                                break;
                            case "EXP":
                                result = Math.pow(result, right);
                                break;
                            default:
                                throw new Error(`Operador desconocido: ${operator}`);
                        }
                    }

                    return result;
                };

                const result = evaluateExpression(expression.trim());
                tokens.push({
                    type: typeof result === 'string' ? "TEXTO" : "NUMERO",
                    value: result.toString()
                });
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
