import { Token } from "../Types/types";

export function processValue(token: Token): any {
    switch (token.type) {
        case "NUMBER":
            return parseFloat(token.value);
        case "LITERAL":
            if (token.value === "true") return true;
            if (token.value === "false") return false;
            if (token.value === "undefined") return undefined;
            break;
        case "ARRAY":
            return parseArray(token.value);
        default:
            return token.value;
    }
}

export function parseArray(arrayValue: string): any[] {
    const items: any[] = [];
    let buffer = "";
    let depth = 0;

    for (let i = 1; i < arrayValue.length - 1; i++) { // Evita corchetes exteriores
        const char = arrayValue[i];

        if (char === "[" && depth >= 0) {
            buffer += char;
            depth++;
        } else if (char === "]" && depth > 1) {
            buffer += char;
            depth--;
        } else if (char === "]" && depth === 1) {
            buffer += char;
            items.push(parseArray(buffer));
            buffer = "";
            depth--;
        } else if (char === "," && depth === 0) {
            if (buffer.trim()) {
                items.push(processArrayValue(buffer.trim()));
            }
            buffer = "";
        } else {
            buffer += char;
        }
    }

    if (buffer.trim()) {
        items.push(processArrayValue(buffer.trim()));
    }

    return items;
}

export function processArrayValue(value: string): any {
    if (/^\d+(\.\d+)?$/.test(value)) return parseFloat(value);

    if (value === "true") return true;
    if (value === "false") return false;

    if (value === "undefined") return undefined;

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) { // Si hay string con comilla lo elimina, debería pero no funciona.
        return value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
        return parseArray(value);
    }

    return value;
}