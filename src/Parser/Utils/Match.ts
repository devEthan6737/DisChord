import { Token } from "../Types/types";
import { peek } from "./Peek";

export function match(tokens: Token[], current: number, type: string): boolean {
    return peek(tokens, current).type === type;
}