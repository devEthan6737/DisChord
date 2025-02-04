export type Token = {
    type: string;
    value: string;
};

export type ASTNode = {
    type: string;
    value?: string;
    children?: ASTNode[];
    left?: object;
    right?: object;
    else?: string;
    elseif?: string
};