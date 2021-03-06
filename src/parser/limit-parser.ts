import type { IToken } from 'ebnf';
import type { ParserInterface } from './parser-interface';
import type { KintoneQueryBuilder } from '../kintone-query-builder';

export class LimitParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    token.children
      .filter((child) => child.type === 'integer')
      .forEach((child) => builder.limit(parseInt(child.text, 10)));
  }
}
