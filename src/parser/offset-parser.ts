import ParserInterface from "./parser-interface";
import KintoneQueryBuilder from "../kintone-query-builder";
import { IToken } from "ebnf";

export default class OffsetParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    for (const child of token.children) {
      if (child.type === "integer") {
        builder.offset(parseInt(child.text));
      }
    }
  }
}
