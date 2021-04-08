import KintoneQueryExpression from "./kintone-query-expression";

/**
 * This class can do anything KintoneQueryExpression can do.
 * In addition, you can add 'offset' 'limit' 'order by' with this class.
 */
export default class KintoneQueryBuilder extends KintoneQueryExpression {
  private orderClause = "";

  private limitClause = "";

  private offsetClause = "";

  public orderBy(variable: null): this;

  public orderBy(variable: string, order?: "asc" | "desc"): this;

  /**
   * Adds an "order by" clause.
   * Calls this function twice or more for multi field "order by".
   * If argument `variable` is `null`, clear "order by" clause.
   *
   * @param variable
   * @param order
   */
  public orderBy(variable: string | null, order?: "asc" | "desc"): this {
    if (variable === null) {
      this.orderClause = "";
      return this;
    }
    if (this.orderClause === "") {
      this.orderClause = `order by ${variable}`;
    } else {
      this.orderClause += `,${variable}`;
    }

    if (order) {
      this.orderClause += ` ${order}`;
    }
    return this;
  }

  /**
   * Adds an "limit" clause.
   * If argument `n` is `null`, clear "limit" clause.
   *
   * @param n
   */
  public limit(n: number | null): this {
    if (n === null) {
      this.limitClause = "";
      return this;
    }
    this.limitClause = `limit ${n}`;
    return this;
  }

  /**
   * Adds an "limit" clause.
   * If argument `n` is `null`, clear "limit" clause.
   *
   * @param n
   */
  public offset(n: number | null): this {
    if (n === null) {
      this.offsetClause = "";
      return this;
    }
    this.offsetClause = `offset ${n}`;
    return this;
  }

  /**
   * Builds query string.
   */
  public build(): string {
    return [
      this.buffer.toQuery(),
      this.orderClause,
      this.limitClause,
      this.offsetClause
    ]
      .filter(c => c !== "")
      .join(" ");
  }
}
