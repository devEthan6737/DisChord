import { ASTNode } from "../Types/types";

class FunctionRegistry {
    private functions: Map<string, { params: string[], block: ASTNode[] }> = new Map();

    public addFunction(name: string, data: { params: string[], block: ASTNode[] }) {
        this.functions.set(name, data);
    }

    public getFunction(name: string): { params: string[], block: ASTNode[] } | undefined {
        return this.functions.get(name);
    }

    public hasFunction(name: string): boolean {
        return this.functions.has(name) !== undefined;
    }
}

const FunctionInstance = new FunctionRegistry();
export default FunctionInstance;