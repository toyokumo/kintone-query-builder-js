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
    private parseClause(): string {
        return "";
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
        let clause = this.parseClause();
        let orderBy = this.parseOrderBy();
        let limit = this.parseLimit();
        let offset = this.parseOffset();
        return { query: clause, orderBy: orderBy, limit: limit, offset: offset };
    }
}
