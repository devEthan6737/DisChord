import { Token } from '../Types/types';
import StateInstance from './State';

export function consume(tokens: Token[], expectedTypes: any): Token {
    const token = tokens[StateInstance.current];
    const expected = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];

    if (!expected.includes(token.type)) throw new Error(`Se esperaba uno de ${expected.join(', ')} pero se encontró ${token.type}`);

    return tokens[StateInstance.increment()];
}