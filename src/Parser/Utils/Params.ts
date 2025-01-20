import { Token } from '../Types/types';
import { Lexer } from '../../Lexer/main';

export function params(value: string): Token {
    const lexer: Token[] = new Lexer(value.slice(1, -1)).tokenize();
    let current = 0;

    while (lexer.length > current) {
        switch (lexer[current].type) {
            case "TIPO":
                current++
                return {
                    type: lexer[current].type,
                    value: lexer[current].type
                };
        }

        current++;
    }

    return lexer[0];
}