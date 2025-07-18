import type { IToken } from 'ebnf';
import type { ParserInterface } from './parser-interface';
import type { KintoneQueryBuilder } from '../kintone-query-builder';
import type { Operator } from '../kintone-query-expression';
import { KintoneQueryExpression } from '../kintone-query-expression';
import { KintoneQueryError } from '../kintone-query-error';

export class ConditionsParser implements ParserInterface {
  apply(builder: KintoneQueryBuilder, token: IToken): void {
    const expr = this.parseConditions(token);
    builder.orWhere(expr);
  }

  private parse(token: IToken): KintoneQueryExpression {
    switch (token.type) {
      case 'conditions':
        return this.parseConditions(token);
      case 'condition':
        return this.parseCondition(token);
      case 'and_conditions':
        return this.parseAndConditions(token);
      case 'parenethesized':
        return this.parseParenethesized(token);
      case 'comp_condition':
        return this.parseCompCondition(token);
      case 'in_condition':
        return this.parseInCondition(token);
      case 'like_condition':
        return this.parseLikeCondition(token);
      case 'is_condition':
        return this.parseIsCondition(token);
      default:
        throw new KintoneQueryError(`token type ${token.type} is invalid`);
    }
  }

  private parseConditions(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    token.children.forEach((child) => expr.orWhere(this.parse(child)));
    return expr;
  }

  private parseAndConditions(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    token.children.forEach((child) => {
      expr.andWhere(this.parse(child));
    });
    return expr;
  }

  private parseCompCondition(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    const field = token.children[0].text;
    const operator = token.children[1].text.trim() as Operator;
    const value = this.parseValue(token.children[2]);
    return expr.where(field, operator, value);
  }

  private parseString(token: IToken): string {
    const quoted = token.text;
    return quoted
      .substr(1, quoted.length - 2)
      .split('\\"')
      .join('"');
  }

  private parseValue(token: IToken): number | string {
    switch (token.children[0].type) {
      case 'number':
        return parseFloat(token.children[0].text);
      case 'string':
        return this.parseString(token.children[0]);
      default:
        return token.children[0].text;
    }
  }

  private parseCondition(token: IToken): KintoneQueryExpression {
    return this.parse(token.children[0]);
  }

  private parseInCondition(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    const field = token.children[0].text;
    const operator = token.children[1].text.trim().replace(/ {2,}/, ' ') as Operator;
    const values = token.children[2].children.map((t) => this.parseValue(t));
    return expr.where(field, operator, values);
  }

  private parseLikeCondition(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    const field = token.children[0].text;
    const operator = token.children[1].text.trim().replace(/ {2,}/, ' ') as Operator;
    const string = this.parseString(token.children[2]);
    expr.where(field, operator, string);
    return expr;
  }

  private parseParenethesized(token: IToken): KintoneQueryExpression {
    return this.parse(token.children[0]);
  }

  private parseIsCondition(token: IToken): KintoneQueryExpression {
    const expr = new KintoneQueryExpression();
    const field = token.children[0].text;
    const operator = token.children[1].text.trim().replace(/ {2,}/g, ' ') as Operator;
    const value = token.children[2].text;
    return expr.where(field, operator, value);
  }
}
