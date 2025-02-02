/**
 * He comentado este fichero porque mañana ya no me acordaré de lo que hice xd
 * He decidido no usar el método consume para evitar errores de tipo en la función
 */

import { Parser } from "../main";
import { Token, ASTNode } from "../Types/types";
import StateInstance from "./State";

export function parseBlock(tokens: Token[]): ASTNode[] { // Extraer tokens de un bloque
    let startIndex = StateInstance.current; // Guardar posición inicial del bloque
    let depth = 0; // Profundidad de anidamiento
    const blockTokens: Token[] = []; // Tokens del bloque

    for (let i = startIndex; i < tokens.length; i++) { // Buscar el inicio del bloque
        if (tokens[i].type === "L_BRACE") { // Inicio del bloque
            depth = 1; // Inicializar profundidad
            startIndex = i + 1; // Saltar L_BRACE
            break;
        }
    }

    for (let i = startIndex; i < tokens.length; i++) { // Extraer tokens del bloque incluyendo anidados
        const token = tokens[i]; // Token actual
        
        if (token.type === "L_BRACE") depth++; // Aumentar profundidad
        else if (token.type === "R_BRACE") depth--; // Disminuir profundidad

        if (depth === 0) { // Fin del bloque
            startIndex = i + 1; // Actualizar startIndex después de R_BRACE
            break;
        }
        
        blockTokens.push(token); // Añadir tokens internos
    }

    if (depth !== 0) throw new Error("Bloque no cerrado con '}'"); // Bloque no cerrado

    const temp = StateInstance.current; // Guardar current global
    StateInstance.setCurrent(0); // Reiniciar current global
    const parse = new Parser(blockTokens).parse(); // Parsear bloque

    StateInstance.setCurrent( // Actualizar current global
        temp                  // Valor anterior de current global
        + 2                   // L_BRACE y R_BRACE
        + blockTokens.length  // Tokens del bloque
    );

    return parse; // Retornar nodos del bloque
}

export function parseBlockWithoutExecute(tokens: Token[]): ASTNode[] { // Sin ejecutar el bloque
    let startIndex = StateInstance.current; // Guardar posición inicial del bloque
    let depth = 0; // Profundidad de anidamiento
    const blockTokens: Token[] = []; // Tokens del bloque
    
    for (let i = startIndex; i < tokens.length; i++) { // Buscar el inicio del bloque
        if (tokens[i].type === "L_BRACE") { // Inicio del bloque
            depth = 1; // Inicializar profundidad
            startIndex = i + 1; // Saltar L_BRACE
            break;
        }
    }

    for (let i = startIndex; i < tokens.length; i++) { // Extraer tokens del bloque incluyendo anidados
        const token = tokens[i]; // Token actual
        
        if (token.type === "L_BRACE") depth++; // Aumentar profundidad
        else if (token.type === "R_BRACE") depth--; // Disminuir profundidad

        if (depth === 0) { // Fin del bloque
            startIndex = i + 1; // Actualizar startIndex después de R_BRACE
            break;
        }
        
        blockTokens.push(token); // Añadir tokens internos
    }

    if (depth !== 0) throw new Error("Bloque no cerrado con '}'"); // Bloque no cerrado

    const temp = StateInstance.current; // Guardar current global

    StateInstance.setCurrent( // Actualizar current global
        temp                  // Valor anterior de current global
        + 2                   // L_BRACE y R_BRACE
        + blockTokens.length  // Tokens del bloque
    );

    return blockTokens; // Retornar nodos del bloque
}