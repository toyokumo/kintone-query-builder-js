import {IToken} from "ebnf";

export class KintoneQueryError extends Error {
    constructor(message?: string, public ast?: IToken) {
        super(message);
    }
}
