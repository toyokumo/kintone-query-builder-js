export interface KintoneQueryToken {
    token: string;
    lineNumber: number;
    columnNumber: number;
}

function makeKintoneQueryToken(token: string, lineNumber: number, columnNumber: number): KintoneQueryToken {
    return { token: token, lineNumber: lineNumber, columnNumber: columnNumber };
}

export class KintoneQueryTokenizer {
    private buffer: string;
    private idx: number;
    private lineNumber: number;
    private columnNumber: number;
    public constructor(source: string) {
        this.buffer = source;
        this.idx = 0;
        this.lineNumber = 1;
        this.columnNumber = 0;
    }
    private peek(): string {
        return this.buffer[this.idx];
    }
    private poll(): string {
        if (this.isNewline(this.buffer[this.idx])) {
            this.lineNumber++;
            this.columnNumber = 0;
        } else
            this.columnNumber++;
        this.idx++;
        return this.buffer[this.idx - 1];
    }
    private isSpace(ch: string): boolean { // TODO: should skip '\t', '\r', '\n', etc... ???
        return ch === ' ' || ch === '\t' || ch === '\r' || ch == '\n';
    }
    private isNewline(ch: string): boolean {
        return ch === '\n';
    }
    private skipSpaces(): void {
        while (!this.isEof() && this.isSpace(this.peek())) {
            this.poll();
        }
    }
    private isEof(): boolean {
        return this.buffer.length === this.idx;
    }
    // NOTE: for debug. don't include this.
    private dumpTokenizerState(): void {
        let state = "";
        for (let i = 0; i < this.buffer.length; i++) {
            state += this.buffer[i];
            if (i == this.idx) {
                state += "@";
            } else {
                state += ",";
            }
        }
        console.log("lineNumber=" + this.lineNumber);
        console.log("columnNumber=" + this.columnNumber);
        console.log(state);
    }
    private isDigit(ch: string): boolean {
        let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return digits.includes(ch);
    }
    private getStringToken(): string {
        let acc: string = "";
        acc += this.poll(); // open "
        while (this.peek() !== '\"') {
            acc += this.poll();
        }
        acc += this.poll(); // close "
        return acc;
    }
    private getNumberToken(): string {
        let acc: string = "";
        while (this.isDigit(this.peek())) {
            acc += this.poll();
        }
        return acc;
    }
    private getToken(): KintoneQueryToken {
        console.assert(!this.isSpace(this.buffer[this.idx]));
        let ln = this.lineNumber;
        let cn = this.columnNumber;
        if (this.peek() === '\"') { // string case. TODO: what about '\'' ???
            return makeKintoneQueryToken(this.getStringToken(), ln, cn);
        }
        if (this.isDigit(this.peek())) { // number: TODO: negative number, floating point number(maybe)
            return makeKintoneQueryToken(this.getNumberToken(), ln, cn);
        }
        if (this.peek() === '(') { // left paren
            return makeKintoneQueryToken(this.poll(), ln, cn);
        }
        if (this.peek() === ')') { // right paren
            return makeKintoneQueryToken(this.poll(), ln, cn);
        }
        if (this.peek() === ',') { // comma
            return makeKintoneQueryToken(this.poll(), ln, cn);
        }
        // identifier
        let acc = "";
        while (!this.isEof() && !this.isSpace(this.peek()) && this.peek() !== ",") {
            acc += this.poll();
        }
        return makeKintoneQueryToken(acc, ln, cn);
    }
    public tokenize(): Array<KintoneQueryToken> {
        let ret: Array<KintoneQueryToken> = [];
        while (!this.isEof()) {
            this.skipSpaces();
            if (this.isEof())
                break;
            ret.push(this.getToken());
        }
        return ret;
    }
}
