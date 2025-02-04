import { parseArray } from "../Utils/arrays";

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
                return typeof _ast === 'object'? _ast.value : _ast;
            } else return peek.type;

        } else if (peek.type === 'MAS' || peek.type === 'MENOS' || peek.type === 'POR' || peek.type === 'ENTRE' || peek.type === 'EXP' || peek.type === 'RESTO' ) {
            let left = executeAST(Array.isArray(peek.left)? peek.left : [ peek.left ]);
            let right = executeAST(Array.isArray(peek.right)? peek.right : [ peek.right ]);
            let value;

            if(left.value) left = left.value;
            if(right.value) right = right.value;

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
                default:
                    throw new Error(`Operador '${peek.type}' no soportado. Valores: ${left}, ${right}`);
            }

            return {
                type: left.type,
                value
            };

        } else if (peek.type === 'NUMERO') {
            return {
                type: "NUMERO",
                value: parseFloat(peek.value)
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

        } else if (peek.children) {
            executeAST(peek.children);
        }

        current++;
    }
};