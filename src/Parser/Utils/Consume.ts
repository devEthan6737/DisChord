import { Token } from '../Types/types';

export function consume(tokens: Token[], current: number, expectedTypes: any): Token {
    const token = tokens[current];
    const expected = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];

    if (!expected.includes(token.type)) throw new Error(`Se esperaba uno de ${expected} pero se encontró ${token.type}`);

    return tokens[current++];
}