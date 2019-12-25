import KintoneQueryExpr from "./kintone-query-expr";

/**
 * This class can do anything KintoneQueryExpr can do.
 * In addition, you can add 'offset' 'limit' 'order by' with this class.
 */
export default class KintoneQueryBuilder extends KintoneQueryExpr {

    private orderClause: string = '';
    private limitClause: string = '';
    private offsetClause: string = '';

    public orderBy(variable: null): this;
    public orderBy(variable: string, order?: string): this;
    public orderBy(variable: string|null, order?: string): this {
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
        let query = '';
        if (!this.buffer.isEmpty()) {
            query = this.buffer.toQuery();
        }
        const clauses = [
            this.orderClause,
            this.limitClause,
            this.offsetClause,
        ];
        return clauses.filter(c => c !== '').reduce((q, c) => q === '' ? c : q + ' ' + c, query);
    }
}
