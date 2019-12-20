import ParserInterface from "./parser-interface";
import KintoneQueryBuilder from "../kintone-query-builder";
import {IToken} from "ebnf";

export default class LimitParser implements ParserInterface {
    apply(builder: KintoneQueryBuilder, token: IToken): void {
        for (let child of token.children) {
            if (child.type === 'integer') {
                builder.limit(parseInt(child.text));
            }
        }
    }
}
