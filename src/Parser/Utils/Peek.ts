import { Token } from '../Types/types';

export function peek(tokens: Token[], current: number): Token {
    if (current >= tokens.length) throw new Error("Se acabaron los tokens");
    return tokens[current];
}