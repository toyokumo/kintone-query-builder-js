import ParserInterface from "./parser-interface";
import KintoneQueryBuilder from "../kintone-query-builder";
import { IToken } from "ebnf";

export default class OrderByParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    for (const child of token.children) {
      this.applySorter(builder, child);
    }
  }

  private applySorter(builder: KintoneQueryBuilder, token: IToken): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const field = token.children.find(t => t.type === "field")!.text;
    const order = token.children.find(t => t.type === "sort_order")?.text as
      | "asc"
      | "desc"
      | undefined;
    builder.orderBy(field, order);
  }
}
