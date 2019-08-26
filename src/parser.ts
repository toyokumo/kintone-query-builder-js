import { KintoneQueryTokenizer } from "./tokenizer";

enum KintoneOrderByType { Desc = 0, Asc }

interface KintoneOrderBy {
    otype: KintoneOrderByType;
    fields: Array<string>;
}

interface KintoneParsedQuery {
    query: string;
    orderBy: KintoneOrderBy;
    limit: number;
    offset: number;
}

export class KintoneQueryParser {
    private tokens: Array<string>;
    private idx: number;
    public constructor(source: string) {
        this.tokens = new KintoneQueryTokenizer(source).tokenize();
        this.idx = 0;
    }
    private peek(): string {
        return this.tokens[this.idx];
    }
    private poll(): string {
        this.idx++;
        return this.tokens[this.idx - 1];
    }
    private isEof(): boolean {
        return this.tokens.length == this.idx;
    }
    private parseValue(): string {
        return this.poll();
    }
    private parseValues(): string {
        // TODO: check () is valid?
        let ret: string = "";
        ret += this.poll(); // (
        ret += this.parseValue(); // TODO: this.poll() maybe?
        while (this.peek() !== ")") {
            if (this.isEof()) {
                break; // TODO: error case.
            }
            ret += this.poll(); // ,
            ret += " ";
            ret += this.parseValue();
        }
        ret += this.poll(); // )
        return ret;
    }
    private parseRhs(): string {
        if (this.peek() === "(") {
            return this.parseValues();
        } else {
            return this.parseValue();
        }
    }
    // TODO: handle error
    private parseClause(): string {
        let lhs = this.poll();
        let op: string = "";
        if (this.peek() === "not") {
            op += this.poll() + " " + this.poll();
        } else {
            op += this.poll();
        }
        let rhs = this.parseRhs();
        return lhs + " " + op + " " + rhs;
    }
    private parseQuery(): string {
        let query = this.parseClause();
        while (this.peek() === "and" || this.peek() === "or") {
            query += " ";
            query += this.poll();
            query += " ";
            query += this.parseClause();
        }
        return query;
    }
    private parseOrderBy(): KintoneOrderBy {
        return { otype: KintoneOrderByType.Desc, fields: [] };
    }
    private parseLimit(): number {
        return 500;
    }
    private parseOffset(): number {
        return 0;
    }
    public parse(): KintoneParsedQuery {
        let query = this.parseQuery();
        let orderBy = this.parseOrderBy();
        let limit = this.parseLimit();
        let offset = this.parseOffset();
        return { query: query, orderBy: orderBy, limit: limit, offset: offset };
    }
}
