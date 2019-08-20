enum KintoneClauseType {
    Eq,
    NotEq,
    Gt,
    Lt,
    Gte,
    Lte,
    In,
    NotIn,
    Like,
    NotLike
}

interface KintoneClause {
    ctype: KintoneClauseType;
    lhs: string; // field code
    rhs: string | number | Array<string|number>;
}

// TODO: this may be strict ???
// type KintoneClause
//     = KintoneEqClause
//     | KintoneNotEqClause
//     | KintoneGtClause
//     | KintoneLtClause
//     | KintoneGteClause
//     | KintoneLteClause
//     | KintoneInClause
//     | KintoneNotInClause
//     | KintoneLikeClause
//     | KintoneNotLikeClause

enum KintoneOrderByType { Desc, Asc }

interface: KintoneOrderBy {
    otype: KintoneOrderByType;
    fields: Array<string>;
}

// TODO: add 'and' 'or'
interface KintoneParsedQuery {
    query: KintoneClause;
    orderBy: KintoneOrderBy;
    limit?: number;
    offset?: number;
}

class KintoneQueryParser {
    private tokens: Array<string>;
    private idx: number;
    public constructor(source: string) {
	this.tokens = source;
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
    private parseClause() : KintoneClause {
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
