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

    constructor(private tokens: Token[]) {
        console.log(tokens)
    }

    public parse(): ASTNode {
        switch(this.peek().type) {
            case "BOT":
                this.current++;
                return this.parseBot();
            case "CONSOLA":
                this.current++;
                return this.parseConsole();
            default:
                this.current++;
                return this.parse();
        }
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
            if (this.match("COMANDO")) {
                children.push(this.parseCommand());
            } else if (this.match("SI")) {
                children.push(this.parseCondition());
            } else {
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
            type: "Command",
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

    // Utility methods
    private consume(expectedType: string): Token {
        const token = this.peek();
        if (token.type !== expectedType) {
            throw new Error(`Se esperaba ${expectedType}, pero se encontró ${token.type}`);
        }
        this.current++;
        return token;
    }

    private match(type: string): boolean {
        return this.peek().type === type;
    }

    private peek(): Token {
        if (this.current >= this.tokens.length) {
            throw new Error("Se acabaron los tokens");
        }
        return this.tokens[this.current];
    }

    private parseConsole(): ASTNode {
        const name = this.consume("STRING");
        return {
            type: "CONSOLA",
            value: name.value
        };
    }
}
