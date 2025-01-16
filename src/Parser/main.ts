type Token = {
    type: string;
    value: string;
};

type ASTNode = {
    type: string;
    value?: string;
    children?: ASTNode[];
};

export class Parser {
    private current = 0;

    constructor(private tokens: Token[]) {}

    // public parse(): ASTNode {
    //     // El parser principal procesa distintos bloques (como BOT o CONSOLA)
    //     switch (this.peek().type) {
    //         case "BOT":
    //             this.consume("BOT");
    //             return this.parseBot();
    //         case "CONSOLA":
    //             this.consume("CONSOLA");
    //             this.parseConsole();

    //             if(this.current >= this.tokens.length)return this.parse();
    //         default:
    //             throw new Error(`${this.peek().type} no es una palabra reservada o no pertenece a este bloque.`);
    //     }
    // }

    public parse(): ASTNode[] {
        const nodes: ASTNode[] = [];
    
        while (this.current < this.tokens.length) {
            switch (this.peek().type) {
                case "BOT":
                    this.consume("BOT");
                    nodes.push(this.parseBot());
                    break;
                case "CONSOLA":
                    this.consume("CONSOLA");
                    nodes.push(this.parseConsole());
                    break;
                default:
                    throw new Error(
                        `${this.peek().type} no es una palabra reservada o no pertenece a este bloque.`
                    );
            }
        }
    
        return nodes;
    }    

    private parseBot(): ASTNode {
        const name = this.consume("STRING");
        const body = this.parseBlock();

        return {
            type: "BOT",
            value: name.value,
            children: body,
        };
    }

    private parseBlock(): ASTNode[] {
        this.consume("L_BRACE");

        const children: ASTNode[] = [];
        while (!this.match("R_BRACE")) {
            switch (this.peek().type) {
                case "COMANDO":
                    children.push(this.parseCommand());
                    break;
                case "SI":
                    children.push(this.parseCondition());
                    break;
                case "RESPONDER":
                    children.push(this.parseReply());
                    break;
                default:
                    throw new Error(`Token inesperado: ${this.peek().type}`);
            }
        }

        this.consume("R_BRACE");
        return children;
    }

    private parseCommand(): ASTNode {
        this.consume("COMANDO");
        const name = this.consume("STRING");
        const body = this.parseBlock();

        return {
            type: "COMANDO",
            value: name.value,
            children: body,
        };
    }

    private parseCondition(): ASTNode {
        this.consume("SI");
        const condition = this.consume("IDENTIFIER");
        const body = this.parseBlock();

        const node: ASTNode = {
            type: "Condition",
            value: condition.value,
            children: body,
        };

        if (this.match("SINO")) {
            this.consume("SINO");
            node.children!.push({
                type: "Else",
                children: this.parseBlock(),
            });
        }

        return node;
    }

    private parseReply(): ASTNode {
        this.consume("RESPONDER");
        const name = this.consume("STRING");

        return {
            type: "RESPONDER",
            value: name.value,
        };
    }

    private parseConsole(): ASTNode {
        const valueToken = this.consume(["STRING", "NUMBER", "LITERAL", "ARRAY"]);
        const value = this.processValue(valueToken); // Procesa el valor para obtener su tipo real
    
        return {
            type: "CONSOLA",
            value,
        };
    }
    
    // Procesa el valor basado en el tipo del token
    private processValue(token: Token): any {
        switch (token.type) {
            case "NUMBER":
                return parseFloat(token.value);
            case "LITERAL":
                if (token.value === "true") return true;
                if (token.value === "false") return false;
                if (token.value === "undefined") return undefined;
                break;
            case "ARRAY":
                return this.parseArray(token.value);
            default:
                return token.value;
        }
    }

    private parseArray(arrayValue: string): any[] {
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
                items.push(this.parseArray(buffer));
                buffer = "";
                depth--;
            } else if (char === "," && depth === 0) {
                if (buffer.trim()) {
                    items.push(this.processArrayValue(buffer.trim()));
                }
                buffer = "";
            } else {
                buffer += char;
            }
        }
    
        if (buffer.trim()) {
            items.push(this.processArrayValue(buffer.trim()));
        }
    
        return items;
    }
    
    private processArrayValue(value: string): any {
        // Verifica si es un número
        if (/^\d+(\.\d+)?$/.test(value)) return parseFloat(value);
    
        // Verifica si es un booleano
        if (value === "true") return true;
        if (value === "false") return false;
    
        // Verifica si es undefined
        if (value === "undefined") return undefined;
    
        // Si es un string con comillas, las elimina
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
    
        // Si es un array anidado, llama a parseArray
        if (value.startsWith("[") && value.endsWith("]")) {
            return this.parseArray(value);
        }
    
        // Retorna el valor tal cual si no coincide con las anteriores
        return value;
    }
    

    // Métodos auxiliares
    private consume(expectedTypes: any): Token {
        const token = this.peek();

        if (!expectedTypes.includes(token.type)) throw new Error(`Se esperaba un tipo pero se encontró ${token.type}`);

        this.current++;
        return token;
    }

    private match(type: string): boolean {
        return this.peek().type === type;
    }

    private peek(): Token {
        if (this.current >= this.tokens.length) throw new Error("Se acabaron los tokens");
        return this.tokens[this.current];
    }
}
