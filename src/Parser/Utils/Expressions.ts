/**
 * Módulo de utilidades para el manejo de expresiones en el lenguaje
 */

import { Lexer } from "../../Lexer/main";
import { executeFunction } from "../Statements/Function";
import { Token } from "../Types/types";
import { consume } from "./Consume";
import FunctionInstance from "./Functions";
import StateInstance from "./State";
import { processValue } from "./Values";
import VarsInstance from "./Vars";

export function parseExpression(tokens: Token[] | string): Token { // Cambiar el tipo de retorno a Token
    let expression: any = Array.isArray(tokens)? consume(tokens, "EXPRESION").value : tokens;
    const tokenPattern = /(\d+|"(?:\\"|[^"])*"|<[^>]+>|[a-zA-Z]+|MAS|MENOS|POR|ENTRE|RESTO|EXP)/g; // Verificar si es una expresión que comienza con TIPO
    const firstTokenMatch = tokenPattern.exec(expression.trim());
    const functionPattern = /^([a-zA-Z_]+)\s*<([^>]*)>$/;
    const match = expression.match(functionPattern);

    if (match && FunctionInstance.hasFunction(match[1])) { // Funciones anidadas en expresiones
        const functionName = match[1];
        let args = match[2].split(";").map((arg: any) => arg.trim()).join(' ');
        StateInstance.setCurrent(StateInstance.current); // + 2 deleted
        args = new Lexer(args).tokenize();

        const evaluatedArgs = args.map((arg: any) => evaluateExpression(arg.value));
        const executedFunction: any = executeFunction(functionName, evaluatedArgs);
 
        return executedFunction;
    }

    if (firstTokenMatch && firstTokenMatch[0] === 'TIPO') {
        expression = parseExpression(expression.slice(5)); // Eliminar el token TIPO
        return { // Retornar el token TIPO
            type: expression.type,
            value: expression.type,
        }
    } else { // Evaluar normalmente otras expresiones
        let result = evaluateExpression(expression.trim());

        if(typeof result === 'string') { // Reemplazar valores booleanos
            if(result.includes('true')) {
                result = result.replace('true', 'verdadero');
            } else if(result.includes('false')) {
                result = result.replace('false', 'falso');
            }
        }

        switch (result) { // Retornar el tipo de dato correspondiente
            case true:
                return {
                    type: "EXPRESION",
                    value: 'verdadero',
                };
            case false:
                return {
                    type: "EXPRESION",
                    value: 'falso',
                };
            default:
                return {
                    type: typeof result === 'string' ? "TEXTO" : "NUMERO",
                    value: result.toString(),
                };
            }
    }
};

const evaluateExpression = (expr: string): any => { // Evaluar la expresión
    const tokens: string[] = [];
    const tokenPattern = /(\d+(\.\d+)?|\[.*?\]|"(?:\\"|[^"])*"|<[^>]+>|[a-zA-Z_]+|MAYOR_IGUAL|MENOR_IGUAL|IGUAL_TIPADO|MAS|MENOS|POR|ENTRE|RESTO|EXP|MAYOR|MENOR|NO|IGUAL)/g; // Actualizar el regex para incluir nuevos operadores
    let match; // Actualizar el while para incluir nuevos operadores

    while ((match = tokenPattern.exec(expr)) !== null) { // Actualizar el while para incluir nuevos operadores
        tokens.push(match[0]);
    }
    
    if (tokens.length === 0) { // Verificar si la expresión está vacía
        throw new Error("Expresión vacía");
    }

    const parseOperand = (operand: string): any => { // Nuevo sistema de parsing con precedencia
        if (operand.startsWith('<')) {
            return evaluateExpression(operand.slice(1, -1).trim());
        } else if (operand.startsWith('"')) {
            return operand.slice(1, -1);
        } else if (operand === 'ESPACIO') return ' ';
        else if (operand === 'INTRO') return '\n';
        else if (operand === 'verdadero') return true;
        else if (operand === 'falso') return false;
        else if (!isNaN(operand as any)) return parseFloat(operand);
        else if (VarsInstance.hasVar(operand)) return VarsInstance.getVar(operand);
        else if (FunctionInstance.hasFunction(operand)) { // Funciones anidadas
            const executedFunction: any = executeFunction(operand, [ processValue(parseExpression(tokens[index++])) ]);

            return executedFunction;
        }

        throw new Error(`Operando desconocido: ${operand}`);
    };

    // Manejar operadores unarios (NO)
    let index = 0;
    const parseUnary = (): any => { // Sistema de parsing unario
        if (tokens[index] === 'NO') { // Si es un operador unario
            index++;
            return !parseUnary(); // Retornar el valor negado
        }
        return parseOperand(tokens[index++]); // Retornar el valor normal
    };

    let result = parseUnary(); // Inicializar el resultado con el primer operando

    // Manejar operadores binarios
    while (index < tokens.length) { // Mientras haya tokens
        const operator = tokens[index++];
        const right = parseUnary(); // Obtener el siguiente operando

        switch (operator) { // Realizar la operación correspondiente
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
            case "Y": result = result && right; break;
            case "O": result = result || right; break;
            default: throw new Error(`Operador desconocido: ${operator}`);
        }
    }

    return result;
};