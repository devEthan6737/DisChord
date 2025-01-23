import { Token } from "src/Parser/Types/types";

const evaluateExpression = (expr: string): any => {
    const tokens: string[] = [];
    // Actualizar el regex para incluir nuevos operadores
    const tokenPattern = /(\d+|"(?:\\"|[^"])*"|<[^>]+>|[a-zA-Z_]+|MAYOR_IGUAL|MENOR_IGUAL|IGUAL_TIPADO|MAS|MENOS|POR|ENTRE|RESTO|EXP|MAYOR|MENOR|NO|IGUAL)/g;
    let match;
    
    while ((match = tokenPattern.exec(expr)) !== null) {
        tokens.push(match[0]);
    }
    
    if (tokens.length === 0) {
        throw new Error("Expresión vacía");
    }

    // Nuevo sistema de parsing con precedencia
    const parseOperand = (operand: string): any => {
        if (operand.startsWith('<')) {
            return evaluateExpression(operand.slice(1, -1).trim());
        } else if (operand.startsWith('"')) {
            return operand.slice(1, -1);
        } else if (operand === 'ESPACIO') return ' ';
        else if (operand === 'INTRO') return '\n';
        else if (operand === 'verdadero') return true;
        else if (operand === 'falso') return false;
        else if (!isNaN(operand as any)) return parseFloat(operand);
        throw new Error(`Operando desconocido: ${operand}`);
    };

    // Manejar operadores unarios (NO)
    let index = 0;
    const parseUnary = (): any => {
        if (tokens[index] === 'NO') {
            index++;
            return !parseUnary();
        }
        return parseOperand(tokens[index++]);
    };

    let result = parseUnary();

    // Manejar operadores binarios
    while (index < tokens.length) {
        const operator = tokens[index++];
        const right = parseUnary();

        switch (operator) {
            case "MAS": result += right; break;
            case "MENOS": result -= right; break;
            case "POR": result *= right; break;
            case "ENTRE": result /= right; break;
            case "RESTO": result %= right; break;
            case "EXP": result = Math.pow(result, right); break;
            case "MAYOR": result = result > right; break;
            case "MENOR": result = result < right; break;
            case "MAYOR_IGUAL": result = result >= right; break;
            case "MENOR_IGUAL": result = result <= right; break;
            case "IGUAL": result = result == right; break;
            case "IGUAL_TIPADO": result = result === right; break;
            default: throw new Error(`Operador desconocido: ${operator}`);
        }
    }

    return result;
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

                // Asegurar de agregar todo como un único token si es BIGINT
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
            
                // Verificar si es una expresión que comienza con TIPO
                const tokenPattern = /(\d+|"(?:\\"|[^"])*"|<[^>]+>|[a-zA-Z]+|MAS|MENOS|POR|ENTRE|RESTO|EXP)/g;
                const firstTokenMatch = tokenPattern.exec(expression.trim());
                
                if (firstTokenMatch && firstTokenMatch[0] === 'TIPO') {
                    // Tokenizar la expresión completa como RAW para el parser
                    tokens.push({ type: "EXPRESION", value: '<' + expression.trim() + '>' });
                } else {
                    // Evaluar normalmente otras expresiones
                    let result = evaluateExpression(expression.trim());

                    if(typeof result === 'string') {
                        if(result.includes('true')) {
                            result = result.replace('true', 'verdadero');
                        } else if(result.includes('false')) {
                            result = result.replace('false', 'falso');
                        }
                    }

                    switch (result) {
                        case true:
                            tokens.push({ type: "BOOL", value: 'verdadero' });
                            break;
                        case false:
                            tokens.push({ type: "BOOL", value: 'falso' });
                            break;
                        default:
                            tokens.push({
                                type: typeof result === 'string' ? "TEXTO" : "NUMERO",
                                value: result.toString()
                            });
                        }
                }
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
                } else if (["verdadero", "falso", "indefinido", "nulo"].includes(value)) {
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
