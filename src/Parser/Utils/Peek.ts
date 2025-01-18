import { Token } from '../Types/types';
import StateInstance from './State';

export function peek(tokens: Token[]): Token {
    if (StateInstance.current >= tokens.length) throw new Error("Se acabaron los tokens");
    return tokens[StateInstance.current];
}