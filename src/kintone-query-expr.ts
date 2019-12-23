import KintoneQueryBuffer from "./kintone-query-buffer";
import {KintoneQueryError} from "./kintone-query-error";
import KintoneQueryBufferElement from "./kintone-query-buffer-element";
import {ConjType} from "./kintone-query-buffer-interface";

/**
 * This class builds logical condition clauses.
 * Note that you can't specify 'offset' or 'order by' with this class.
 * In that case, you should use KintoneQueryBuilder.
 * KintoneQueryExpr can be a argument of new KintoneQueryBuilder() to build  a nested query like '(A and B) or (C and D)'.
 */
export default class KintoneQueryExpr {

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
            /FROM_TODAY\(-?\d+,DAYS\)/,
            /FROM_TODAY\(-?\d+,WEEKS\)/,
            /FROM_TODAY\(-?\d+,MONTHS\)/,
            /FROM_TODAY\(-?\d+,YEARS\)/,
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

    private static valToString(val: string | number | (string | number)[]): string {
        if (typeof val === "string") {
            if (KintoneQueryExpr.funcCheck(val)) {
                return val;
            }
            return '"' + KintoneQueryExpr.escapeDoubleQuote(val) + '"';
        }
        if (typeof val === "number") {
            return "" + val;
        }
        return '(' + val.map(KintoneQueryExpr.valToString).join(',') + ')';
    }


    public static genWhereClause(variable: string,
                                 operator: string,
                                 val: string | number | (string | number)[]): string {
        if (operator === 'in' || operator === 'not in') {
            if (!Array.isArray(val)) {
                throw new KintoneQueryError('Invalid val type: In case operator === \'in\', val must be array, but given ' + typeof val)
            }
        }
        return `${variable} ${operator} ${KintoneQueryExpr.valToString(val)}`;
    }

    private whereWithVarOpVal(variable: string,
                              operator: string,
                              val: string | number | (string | number)[],
                              conj: ConjType): this {
        this.buffer.append(new KintoneQueryBufferElement(
            KintoneQueryExpr.genWhereClause(variable, operator, val),
            conj)
        );
        return this;
    }

    private whereWithExpr(expr: KintoneQueryExpr, conj: ConjType): this {
        if (expr.buffer.isEmpty()) {
            return this;
        }
        expr.buffer.setConj(conj);
        this.buffer.append(expr.buffer);
        return this;
    }

    public where(varOrExpr: KintoneQueryExpr): this;
    public where(varOrExpr: string, operator: string, val: string | number | (string | number)[]): this;
    public where(varOrExpr: string | KintoneQueryExpr,
                 operator?: string,
                 val?: string | number | (string | number)[]): this {
        if (varOrExpr instanceof KintoneQueryExpr) {
            return this.andWhere(varOrExpr);
        }
        return this.andWhere(varOrExpr, operator!, val!);
    }

    public andWhere(varOrExpr: KintoneQueryExpr): this;
    public andWhere(varOrExpr: string, operator: string, val: string | number | (string | number)[]): this;
    public andWhere(varOrExpr: string | KintoneQueryExpr,
                    operator?: string,
                    val?: string | number | (string | number)[]): this {
        if (varOrExpr instanceof KintoneQueryExpr) {
            return this.whereWithExpr(varOrExpr, 'and');
        }
        return this.whereWithVarOpVal(varOrExpr, operator!, val!, 'and');
    }

    public orWhere(varOrExpr: KintoneQueryExpr): this;
    public orWhere(varOrExpr: string, operator: string, val: string | number | (string | number)[]): this;
    public orWhere(varOrExpr: string | KintoneQueryExpr,
                   operator?: string,
                   val?: string | number | (string | number)[]): this {
        if (varOrExpr instanceof KintoneQueryExpr) {
            return this.whereWithExpr(varOrExpr, 'or');
        }
        return this.whereWithVarOpVal(varOrExpr, operator!, val!, 'or');
    }
}
