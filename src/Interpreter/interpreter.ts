import { parseArray } from "../Utils/arrays";

const varsInstance: any = {};

export function executeAST(ast: any): any {
    // console.log(ast);
    // console.log(JSON.stringify(ast, null, 2));

    let current = 0;
    while (current < ast.length) {
        let peek = ast[current];

        if (peek.type === 'CONSOLA') {
            if (peek.value === 'EXPRESION') {
                const _ast = executeAST(peek.children);
                console.log(typeof _ast === 'object'? _ast.value : _ast);
            } else console.log(peek.value);

        } else if (peek.type === 'TIPO') {
            if (peek.value === 'EXPRESION') {
                const _ast = executeAST(peek.children);
                return typeof _ast === 'object'? _ast.type : _ast;
            } else return peek.type;

        } else if (peek.type === 'MAS' || peek.type === 'MENOS' || peek.type === 'POR' || peek.type === 'ENTRE' || peek.type === 'EXP' || peek.type === 'RESTO' ||
                   peek.type === 'IGUAL' ||  peek.type === 'IGUAL_TIPADO' || peek.type === 'MAYOR' ||  peek.type === 'MAYOR_IGUAL' ||  peek.type === 'MENOR' || peek.type === 'MENOR_IGUAL' ||
                   peek.type === 'Y' || peek.type === 'O') {
            let left = executeAST(Array.isArray(peek.left)? peek.left : [ peek.left ]);
            let right = executeAST(Array.isArray(peek.right)? peek.right : [ peek.right ]);
            let value;
            let leftType = left.type;

            if (left.value) left = left.value;
            if (right.value) right = right.value;
            if (left === 'verdadero') left = true;
            else if (left === 'falso') left = false;
            if (right === 'verdadero') right = true;
            if (right === 'falso') right = false; 

            switch (peek.type) {
                case 'MAS':
                    value = left + right;
                    break;
                case 'MENOS':
                    value = left - right;
                    break;
                case 'POR':
                    value = left * right;
                    break;
                case 'ENTRE':
                    if (right.value === 0) return { type: 'NULO', value: 'nulo' };
                    value = left / right;
                    break;
                case 'EXP':
                    value = left ** right;
                    break;
                case 'RESTO':
                    value = left % right;
                    break;
                case 'IGUAL':
                    leftType = 'BOOL';
                    value = left == right? 'verdadero' : 'falso'
                    break;
                case 'IGUAL_TIPADO':
                    leftType = 'BOOL';
                    value = left === right? 'verdadero' : 'falso'
                    break;
                case 'MAYOR':
                    leftType = 'BOOL';
                    value = left > right? 'verdadero' : 'falso'
                    break;
                case 'MAYOR_IGUAL':
                    leftType = 'BOOL';
                    value = left >= right? 'verdadero' : 'falso'
                    break;
                case 'MENOR':
                    leftType = 'BOOL';
                    value = left < right? 'verdadero' : 'falso'
                    break;
                case 'MENOR_IGUAL':
                    leftType = 'BOOL';
                    value = left <= right? 'verdadero' : 'falso'
                    break;
                case 'Y':
                    leftType = 'BOOL';
                    value = left && right? 'verdadero' : 'falso'
                    break;
                case 'O':
                    leftType = 'BOOL';
                    value = left || right? 'verdadero' : 'falso'
                    break;
                default:
                    throw new Error(`Operador '${peek.type}' no soportado. Valores: ${left}, ${right}`);
            }

            return {
                type: leftType,
                value
            };

        } else if (peek.type === 'NO') {
            const operand = executeAST(Array.isArray(peek.value) ? peek.value : [ peek.value ]);
            let value = operand.value;

            if (value === 'verdadero') value = true;
            else if (value === 'falso') value = false;

            const result = !value;

            return {
                type: "BOOL",
                value: result ? 'verdadero' : 'falso'
            };

        } else if (peek.type === 'SI') {
            let condition = executeAST(peek.value);

            if (condition.value === 'verdadero') {
                executeAST(peek.children);
            } else {
                let executed = false;

                if (peek.elseif) {
                    for (const elseif of peek.elseif) {
                        const elseIfCondition = executeAST(elseif.value);
                        if (elseIfCondition.value === 'verdadero') {
                            executeAST(elseif.children);
                            executed = true;
                            break;
                        }
                    }
                }

                if (!executed && peek.else) {
                    executeAST(peek.else);
                }

            }

        } else if (peek.type === 'VAR') {
            const value = executeAST(Array.isArray(peek.content)? peek.content : [ peek.content ]);
            varsInstance[peek.value] = value.value;

        } else if (peek.type === 'MIENTRAS') {
            while (executeAST(peek.value).value === 'verdadero') {
                executeAST(peek.children);
            }

        } else if (peek.type === 'DEVOLVER') {
            if (peek.value === 'EXPRESION') {
                const _ast = executeAST(peek.children);
                return typeof _ast === 'object'? _ast.value : _ast;
            } else return peek.value;

        } else if (peek.type === 'PARAR' || peek.type === 'SALTAR') {
            return {
                type: peek.type
            }

        } else if (peek.type === 'NUMERO') {
            return {
                type: "NUMERO",
                value: peek.value == '0'? 0 : parseFloat(peek.value)
            };
        
        } else if (peek.type === 'BIGINT') {
            return {
                type: "BIGINT",
                value: parseFloat(peek.value)
            };
        
        } else if (peek.type === 'BOOL') {
            return {
                type: "BOOL",
                value: peek.value
            };
        
        } else if (peek.type === 'TEXTO') {
            return {
                type: "TEXTO",
                value: peek.value
            };
        
        } else if (peek.type === 'ESPACIO') {
            return {
                type: "TEXTO",
                value: ' '
            };
        
        } else if (peek.type === 'INTRO') {
            return {
                type: "TEXTO",
                value: '\n'
            };
        
        } else if (peek.type === 'LISTA') {
            return {
                type: "LISTA",
                value: parseArray(peek.value)
            };

        } else if (peek.type === 'NULO') {
            return {
                type: "NULO",
                value: peek.value
            };
        
        } else if (peek.type === 'INDEFINIDO') {
            return {
                type: "INDEFINIDO",
                value: peek.value
            };

        } else if (varsInstance[peek.type] || varsInstance[peek.type] == 0) {
            return varsInstance[peek.type];

        } else if (peek.children) {
            executeAST(peek.children);

        }else throw new Error(`${peek.type} no es una palabra reservada o no pertenece a este bloque.`);

        current++;
    }
};