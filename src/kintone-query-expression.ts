import KintoneQueryBuffer from "./kintone-query-buffer";
import KintoneQueryError from "./kintone-query-error";
import KintoneQueryBufferElement from "./kintone-query-buffer-element";
import { ConjType } from "./kintone-query-buffer-interface";

export type Operator =
  | "="
  | "<"
  | ">"
  | "<="
  | ">="
  | "!="
  | "in"
  | "not in"
  | "like"
  | "not like";

type ValueType = string | number | (string | number)[];

/**
 * This class builds logical condition clauses.
 * Note that you can't specify 'offset' or 'order by' with this class.
 * In that case, you should use KintoneQueryBuilder.
 * KintoneQueryExpression can be a argument of new KintoneQueryBuilder() to build  a nested query like '(A and B) or (C and D)'.
 */
export default class KintoneQueryExpression {
  protected buffer: KintoneQueryBuffer;

  constructor() {
    this.buffer = new KintoneQueryBuffer();
  }

  private static funcCheck(s: string): boolean {
    const regExps = [
      /LOGINUSER\(\)/,
      /PRIMARY_ORGANIZATION\(\)/,
      /NOW\(\)/,
      /TODAY\(\)/,
      /FROM_TODAY\(-?\d+,( )*DAYS\)/,
      /FROM_TODAY\(-?\d+,( )*WEEKS\)/,
      /FROM_TODAY\(-?\d+,( )*MONTHS\)/,
      /FROM_TODAY\(-?\d+,( )*YEARS\)/,
      /THIS_WEEK\(\)/,
      /THIS_WEEK\(SUNDAY\)/,
      /THIS_WEEK\(MONDAY\)/,
      /THIS_WEEK\(TUESDAY\)/,
      /THIS_WEEK\(WEDNESDAY\)/,
      /THIS_WEEK\(THURSDAY\)/,
      /THIS_WEEK\(FRIDAY\)/,
      /THIS_WEEK\(SATURDAY\)/,
      /LAST_WEEK\(\)/,
      /LAST_WEEK\(SUNDAY\)/,
      /LAST_WEEK\(MONDAY\)/,
      /LAST_WEEK\(TUESDAY\)/,
      /LAST_WEEK\(WEDNESDAY\)/,
      /LAST_WEEK\(THURSDAY\)/,
      /LAST_WEEK\(FRIDAY\)/,
      /LAST_WEEK\(SATURDAY\)/,
      /THIS_MONTH\(\)/,
      /THIS_MONTH\(([1-9]|([1-2][0-9])|(3[0-1]))\)/,
      /THIS_MONTH\(LAST\)/,
      /LAST_MONTH\(\)/,
      /LAST_MONTH\(([1-9]|([1-2][0-9])|(3[0-1]))\)/,
      /LAST_MONTH\(LAST\)/,
      /THIS_YEAR\(\)/
    ];

    return regExps.some(r => s.match(r));
  }

  private static escapeDoubleQuote(s: string): string {
    return s.split('"').join('\\"');
  }

  private static valueToString(value: ValueType): string {
    if (typeof value === "string") {
      if (KintoneQueryExpression.funcCheck(value)) {
        return value;
      }
      return '"' + KintoneQueryExpression.escapeDoubleQuote(value) + '"';
    }
    if (typeof value === "number") {
      return "" + value;
    }
    return (
      "(" + value.map(KintoneQueryExpression.valueToString).join(",") + ")"
    );
  }

  private static generateConditionClause(
    variable: string,
    operator: Operator,
    value: ValueType
  ): string {
    if (operator === "in" || operator === "not in") {
      if (!Array.isArray(value)) {
        throw new KintoneQueryError(
          "Invalid value type: In case operator === 'in', value must be array, but given " +
            typeof value
        );
      }
    }
    return `${variable} ${operator} ${KintoneQueryExpression.valueToString(
      value
    )}`;
  }

  private whereWithVarOpVal(
    variable: string,
    operator: Operator,
    value: ValueType,
    conj: ConjType
  ): this {
    this.buffer.append(
      new KintoneQueryBufferElement(
        KintoneQueryExpression.generateConditionClause(
          variable,
          operator,
          value
        ),
        conj
      )
    );
    return this;
  }

  private whereWithExpr(
    expression: KintoneQueryExpression,
    conj: ConjType
  ): this {
    if (expression.buffer.isEmpty()) {
      return this;
    }
    expression.buffer.setConj(conj);
    this.buffer.append(expression.buffer);
    return this;
  }

  public where(varOrExpr: KintoneQueryExpression): this;
  public where(varOrExpr: string, operator: Operator, value: ValueType): this;
  /**
   * Adds query condition.
   *
   * @param varOrExpr
   * @param operator
   * @param value
   */
  public where(
    varOrExpr: string | KintoneQueryExpression,
    operator?: Operator,
    value?: ValueType
  ): this {
    if (varOrExpr instanceof KintoneQueryExpression) {
      return this.andWhere(varOrExpr);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.andWhere(varOrExpr, operator!, value!);
  }

  public andWhere(varOrExpr: KintoneQueryExpression): this;
  public andWhere(
    varOrExpr: string,
    operator: Operator,
    value: ValueType
  ): this;
  /**
   * Adds query condition.
   * The condition is connected to existing conditions by "and".
   *
   * @param varOrExpr
   * @param operator
   * @param value
   */
  public andWhere(
    varOrExpr: string | KintoneQueryExpression,
    operator?: Operator,
    value?: ValueType
  ): this {
    if (varOrExpr instanceof KintoneQueryExpression) {
      return this.whereWithExpr(varOrExpr, "and");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.whereWithVarOpVal(varOrExpr, operator!, value!, "and");
  }

  public orWhere(varOrExpr: KintoneQueryExpression): this;
  public orWhere(varOrExpr: string, operator: Operator, value: ValueType): this;
  /**
   * Adds query condition.
   * The condition is connected to existing conditions by "or".
   *
   * @param varOrExpr
   * @param operator
   * @param value
   */
  public orWhere(
    varOrExpr: string | KintoneQueryExpression,
    operator?: Operator,
    value?: ValueType
  ): this {
    if (varOrExpr instanceof KintoneQueryExpression) {
      return this.whereWithExpr(varOrExpr, "or");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.whereWithVarOpVal(varOrExpr, operator!, value!, "or");
  }
}
