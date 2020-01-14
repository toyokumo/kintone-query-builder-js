import KintoneQueryExpression from "./kintone-query-expression";

/**
 * This class can do anything KintoneQueryExpression can do.
 * In addition, you can add 'offset' 'limit' 'order by' with this class.
 */
export default class KintoneQueryBuilder extends KintoneQueryExpression {

    private orderClause: string = '';
    private limitClause: string = '';
    private offsetClause: string = '';

    public orderBy(variable: null): this;
    public orderBy(variable: string, order?: 'asc'|'desc'): this;
    public orderBy(variable: string|null, order?: 'asc'|'desc'): this {
        if (variable === null) {
            this.orderClause = '';
            return this;
        }
        if (this.orderClause === '') {
            this.orderClause = `order by ${variable}`;
        } else {
            this.orderClause += `,${variable}`;
        }

        if (order) {
            this.orderClause += ` ${order}`;
        }
        return this;
    }

    public limit(n: number|null): this {
        if (n === null) {
            this.limitClause = '';
            return this;
        }
        this.limitClause = `limit ${n}`;
        return this;
    }

    public offset(n: number|null): this {
        if (n === null) {
            this.offsetClause = '';
            return this;
        }
        this.offsetClause = `offset ${n}`;
        return this;
    }

    public build(): string {
        return [
            this.buffer.toQuery(),
            this.orderClause,
            this.limitClause,
            this.offsetClause,
        ].filter(c => c !== '').join(' ');
    }
}
