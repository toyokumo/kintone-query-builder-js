import KintoneQueryExpr from "./kintone-query-expr";

/**
 * This class can do anything KintoneQueryExpr can do.
 * In addition, you can add 'offset' 'limit' 'order by' with this class.
 */
export default class KintoneQueryBuilder extends KintoneQueryExpr {

    private orderClause: string = '';
    private limitClause: string = '';
    private offsetClause: string = '';

    public orderBy(variable: string, order: string): this {
        if (this.orderClause === '') {
            this.orderClause = `order by ${variable} ${order}`;
        } else {
            this.orderClause += `,${variable} ${order}`;
        }
        return this;
    }

    public limit(n: number): this {
        this.limitClause = `limit ${n}`;
        return this;
    }

    public offset(n: number): this {
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
