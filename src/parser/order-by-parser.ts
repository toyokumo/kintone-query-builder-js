import type { IToken } from 'ebnf';
import type { ParserInterface } from './parser-interface';
import type { KintoneQueryBuilder } from '../kintone-query-builder';

export class OrderByParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    token.children.forEach((child) => this.applySorter(builder, child));
  }

  private applySorter(builder: KintoneQueryBuilder, token: IToken): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const field = token.children.find((t) => t.type === 'field')!.text;
    const order = token.children.find((t) => t.type === 'sort_order')?.text as 'asc' | 'desc' | undefined;
    builder.orderBy(field, order);
  }
}
