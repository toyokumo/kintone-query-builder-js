import { KintoneQueryTokenizer } from "./tokenizer";

enum KintoneOrderByType { Desc, Asc }

interface: KintoneOrderBy {
    otype: KintoneOrderByType;
    fields: Array<string>;
}

interface KintoneParsedQuery {
    query: string;
    orderBy: KintoneOrderBy;
    limit?: number;
    offset?: number;
}

class KintoneQueryParser {
    private tokens: Array<string>;
    private idx: number;
    public constructor(source: string) {
	this.tokens = new KintoneQueryTokenizer(source).tokenize();
	this.idx = 0;
    }
    private peek() : string {
	return this.tokens[this.idx];
    }
    private poll() : string {
	this.idx++;
	return this.tokens[this.idx-1];
    }
    private isEof() : boolean {
	return tokens.length == this.idx;
    }
    private parseClause() : string {
    }
    private parseOrderBy() : KintoneOrderBy {
    }
    private parseLimit() : number {
    }
    private parseOffset() : number {
    }
    public parse() : KintoneParsedQuery {
	let clause = this.parseClause();
	let orderBy = this.parseOrderBy();
	let limit = this.parseLimit();
	let offset = this.parseOffset();
	return {clause: clause, orderBy: orderBy, limit: limit, offset: offset};
    }
}
