export function parseArray(arrayValue: string): any[] {
    const items: any[] = [];
    let buffer = "";
    let depth = 0;

    // Recorremos omitiendo los corchetes exteriores
    for (let i = 1; i < arrayValue.length - 1; i++) {
        const char = arrayValue[i];

        if (char === "[" && depth >= 0) {
            buffer += char;
            depth++;
        } else if (char === "]" && depth > 1) {
            buffer += char;
            depth--;
        } else if (char === "]" && depth === 1) {
            buffer += char;
            items.push(parseArray(buffer.trim()));
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

    if (buffer.trim() !== "") {
        const item = buffer.trim();

        if (item[0] === '[') {
            // Se usa trim() para asegurar que el string empieza con '[' y termina con ']'
            const itemProcess = item[item.length - 1] === ']' ? parseArray(item.trim()) : processArrayValue(item.slice(1).trim());
            if (itemProcess !== '' || Array.isArray(itemProcess)) items.push(itemProcess);
        } else {
            items.push(processArrayValue(item));
        }
    }

    return items;
}

export function processArrayValue(value: string): any {
    if (/^\d+(\.\d+)?$/.test(value)) return parseFloat(value);

    if (value === "undefined") return undefined;

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) { // Si hay string con comilla lo elimina, debería pero no funciona.
        return value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
        return parseArray(value);
    }

    return value;
}