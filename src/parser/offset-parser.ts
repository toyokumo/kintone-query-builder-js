import type { IToken } from "ebnf";
import type ParserInterface from "./parser-interface";
import type KintoneQueryBuilder from "../kintone-query-builder";

export default class OffsetParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    for (const child of token.children) {
      if (child.type === "integer") {
        builder.offset(parseInt(child.text));
      }
    }
  }
}
