import KintoneQueryBuilder from "../kintone-query-builder";
import {IToken} from "ebnf";

export default interface ParserInterface {
    apply(builder: KintoneQueryBuilder, token: IToken): void;
}

