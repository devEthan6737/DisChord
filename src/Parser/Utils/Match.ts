import { Token } from "../Types/types";
import { peek } from "./Peek";

export function match(tokens: Token[], type: string): boolean {
    return peek(tokens).type === type;
}