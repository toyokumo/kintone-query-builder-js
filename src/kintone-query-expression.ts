import KintoneQueryBuffer from "./kintone-query-buffer";
import KintoneQueryBufferElement, {
  Operator,
  ValueType
} from "./kintone-query-buffer-element";
import { ConjType } from "./kintone-query-buffer-interface";

/**
 * This class builds logical condition clauses.
 * Note that you can't specify 'offset' or 'order by' with this class.
 * In that case, you should use KintoneQueryBuilder.
 * KintoneQueryExpression can be a argument of new KintoneQueryBuilder() to build  a nested query like '(A and B) or (C and D)'.
 */
export default class KintoneQueryExpression {
  public buffer: KintoneQueryBuffer;

  constructor() {
    this.buffer = new KintoneQueryBuffer();
  }

  private whereWithVarOpVal(
    variable: string,
    operator: Operator,
    value: ValueType,
    conj: ConjType
  ): this {
    this.buffer.append(
      new KintoneQueryBufferElement(variable, operator, value, conj)
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
