import type { IToken } from "ebnf";
import type KintoneQueryBuilder from "../kintone-query-builder";

export default interface ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void;
}
