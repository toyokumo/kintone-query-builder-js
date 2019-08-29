import { KintoneQueryTokenizer, KintoneQueryToken } from "./tokenizer";

export enum KintoneOrderByType { Desc = 0, Asc }

interface KintoneOrderBy {
    field: string;
    orderType: KintoneOrderByType;
}

interface KintoneParsedQuery {
    query: string;
    orderBy: Array<KintoneOrderBy>;
    limit: number;
    offset: number;
}

const maxLimit = 500;
const defaultLimit = maxLimit;
const defaultOffset = 0;

export class KintoneQueryParseError extends Error {
    name: string;
    message: string;
    lineNumber: number;
    columnNumber: number;
    constructor(message: string, lineNumber: number = -1, columnNumber: number = -1) {
        // lineNumber = -1 and columnNumber = -1 if no more token error
        super(); // TODO: super(message); ??? but it produces an warning
        this.message = message;
        this.name = "KintoneQueryParseError";
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
}

export class KintoneQueryParser {
    private tokens: Array<KintoneQueryToken>;
    private idx: number;
    public constructor(source: string) {
        this.tokens = new KintoneQueryTokenizer(source).tokenize();
        this.idx = 0;
    }
    private peek(): string {
        if (this.isEof()) {
            throw new KintoneQueryParseError("unexpected the end of tokens");
        }
        return this.tokens[this.idx].token;
    }
    private getLineNumberOfFirstToken(): number {
        return this.tokens[this.idx].lineNumber;
    }
    private getColumnNumberOfFirstToken(): number {
        return this.tokens[this.idx].columnNumber;
    }
    // TODO: throw error if out of index
    private poll(): string {
        if (this.isEof()) {
            throw new KintoneQueryParseError("unexpected the end of tokens");
        }
        this.idx++;
        return this.tokens[this.idx - 1].token;
    }
    // TODO: throw error if out of index
    private peek2(): string {
        if (this.idx + 1 >= this.tokens.length)
            throw new KintoneQueryParseError("unexpected the end of tokens");
        return this.tokens[this.idx + 1].token;
    }
    private canPeek2(): boolean {
        return this.tokens.length > this.idx + 1;
    }
    private isEof(): boolean {
        return this.tokens.length == this.idx;
    }
    // NOTE: for debug
    private dumpParserState(): void {
        let state = "";
        for (let i = 0; i < this.tokens.length; i++) {
            state += this.tokens[i].token;
            if (i == this.idx) {
                state += "@";
            } else {
                state += ",";
            }
        }
        console.log(state);
        console.log("thid.idx = " + this.idx);
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
                throw new KintoneQueryParseError("unexpected the end of tokens. maybe unbalanced parentheses.");
            }
            if (this.peek() !== ",")
                throw new KintoneQueryParseError(
                    `expected ',', but got ${this.peek()}`,
                    this.getLineNumberOfFirstToken(),
                    this.getColumnNumberOfFirstToken()
                );
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
        let hasParen = false;
        if (this.peek() === "(") {
            this.poll();
            hasParen = true;
        }
        let lhs = this.poll();
        let op: string = "";
        let opLineNumber = this.getLineNumberOfFirstToken();
        let opColumnNumber = this.getColumnNumberOfFirstToken();
        if (this.peek() === "not") {
            op += this.poll() + " " + this.poll();
        } else {
            op += this.poll();
        }
        const allowed: Array<string> = ["=", "!=", ">", "<", ">=", "<=", "in", "not in", "like", "not like"];
        if (!allowed.includes(op)) {
            throw new KintoneQueryParseError(
                `expected '=' or '!=' or '>' or '<' or '>=' or '<=' or 'in' or 'not in' or 'like' or 'not like', but got ${op}`,
                opLineNumber,
                opColumnNumber
            );
        }
        let rhs = this.parseRhs();
        let ret = lhs + " " + op + " " + rhs;
        if (hasParen) {
            if (this.peek() !== ")") {
                throw new KintoneQueryParseError(
                    `expected ')', but got ${this.peek()}`,
                    this.getLineNumberOfFirstToken(),
                    this.getColumnNumberOfFirstToken()
                );
            }
            this.poll(); // skip )
            return "(" + ret + ")";
        }
        return ret;
    }
    private parseAndOr(): string {
        let ret = "";
        while (!this.isEof() && (this.peek() === "and" || this.peek() === "or")) {
            ret += " ";
            ret += this.poll();
            ret += " ";
            ret += this.parseQuery();
        }
        return ret;
    }
    private parseQuery(): string {
        if (this.peek() === "(") {
            this.poll(); // skip (
            let query = this.parseQuery();
            query += this.parseAndOr();
            this.poll(); // skip )
            return "(" + query + ")" + this.parseAndOr();
        } else {
            return this.parseClause() + this.parseAndOr();
        }
    }
    private stringToKintoneOrderByType(s: string): KintoneOrderByType {
        if (s === "desc")
            return KintoneOrderByType.Desc;
        return KintoneOrderByType.Asc;
    }
    private parseFields(): Array<KintoneOrderBy> {
        let ret: Array<KintoneOrderBy> = [];
        if (this.isEof()) {
            throw new KintoneQueryParseError("unexpected the end of tokens");
        }
        let firstField = this.poll();
        if (!this.isEof() && (this.peek() === "desc" || this.peek() === "asc")) {
            ret.push({ field: firstField, orderType: this.stringToKintoneOrderByType(this.poll()) });
        } else {
            ret.push({ field: firstField, orderType: KintoneOrderByType.Desc });
        }
        while (!this.isEof() && this.peek() === ",") {
            this.poll(); // skip ,
            let field = this.poll();
            if (!this.isEof() && (this.peek() === "desc" || this.peek() === "asc")) {
                ret.push({ field: field, orderType: this.stringToKintoneOrderByType(this.poll()) });
            } else {
                ret.push({ field: field, orderType: KintoneOrderByType.Desc });
            }
        }
        return ret;
    }
    private parseOrderBy(): Array<KintoneOrderBy> {
        if (!this.isEof() && this.peek() === "order") {
            this.poll(); // skip 'order'
            if (this.peek() !== "by") {
                throw new KintoneQueryParseError(
                    `expected 'by', but got ${this.peek()}`,
                    this.getLineNumberOfFirstToken(),
                    this.getColumnNumberOfFirstToken()
                );
            }
            this.poll(); // skip by
            return this.parseFields();
        }
        return [];
    }
    private parseLimit(): number {
        if (!this.isEof() && this.peek() === 'limit') {
            this.poll(); // skip 'limit'
            let numString = this.peek();
            let num = parseInt(numString);
            if (!(0 <= num && num <= maxLimit)) {
                throw new KintoneQueryParseError(
                    `expected ')', but got ${numString}`,
                    this.getLineNumberOfFirstToken(),
                    this.getColumnNumberOfFirstToken()
                )
            }
            this.poll(); // skip numString
            return num;
        }
        return defaultLimit;
    }
    private parseOffset(): number {
        if (!this.isEof() && this.peek() === 'offset') {
            this.poll(); // skip 'offset'
            // TODO: treat float case ??? (maybe not)
            let numString = this.peek();
            let num = parseInt(numString);
            if (!(0 <= num)) {
                throw new KintoneQueryParseError(
                    `expected ')', but got ${numString}`,
                    this.getLineNumberOfFirstToken(),
                    this.getColumnNumberOfFirstToken()
                )
            }
            this.poll(); // skip numString
            return num;
        }
        return defaultOffset;
    }
    public parse(): KintoneParsedQuery {
        let query = "";
        // TODO: refactor name queryTokens
        const queryTokens: Array<string> = ["=", "!=", ">", "<", ">=", "<=", "in", "not", "like"];
        if (!this.isEof() && this.peek() === "(") {
            query = this.parseQuery();
        } else if (this.canPeek2() && queryTokens.includes(this.peek2())) {
            query = this.parseQuery();
        }
        // TODO: "limit 5 offset 3 orderBy hoge asc" also happens (order)
        let orderBy = this.parseOrderBy();
        let limit = this.parseLimit();
        let offset = this.parseOffset();
        if (!this.isEof()) {
            throw new KintoneQueryParseError(
                `expected end of the tokens, but got ${this.peek()}`,
                this.getLineNumberOfFirstToken(),
                this.getColumnNumberOfFirstToken()
            );
        }
        return { query: query, orderBy: orderBy, limit: limit, offset: offset };
    }
}
