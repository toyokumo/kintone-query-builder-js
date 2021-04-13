import type { IToken } from 'ebnf';
import type { KintoneQueryBuilder } from '../kintone-query-builder';

export interface ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void;
}
