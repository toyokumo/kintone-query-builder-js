export class KintoneQueryTokenizer {
    private buffer: string;
    private idx: number;
    public constructor(source: string) {
	this.buffer = source;
	this.idx = 0;
    }
    private peek() : string {
	return this.buffer[this.idx];
    }
    private poll() : string {
	this.idx++;
	return this.buffer[this.idx-1];
    }
    private isSpace(ch: string) : boolean { // TODO: should skip '\t', '\r', '\n', etc... ???
	return ch === ' ';
    }
    private skipSpaces() : void {
	while(!this.isEof()&&this.isSpace(this.peek())) {
	    this.poll();
	}
    }
    private isEof() : boolean {
	return this.buffer.length === this.idx;
    }
    private isDigit(ch : string) : boolean {
	let digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	return digits.includes(ch);
    }
    private getStringToken(): string {
	let acc : string = "";
	acc += this.poll(); // open "
	while(this.peek()!=='\"') {
	    acc += this.poll();
	}
	acc += this.poll(); // close "
	return acc;
    }
    private getNumberToken(): string {
	let acc : string = "";
	while(this.isDigit(this.peek())) {
	    acc+=this.poll();
	}
	return acc;
    }
    private getToken() : string {
	// assert(!this.isSpace(this.buffer[this.idx]));
	if(this.peek()==='\"') { // string case. TODO: what about '\'' ???
	    return this.getStringToken();
	}
	if(this.isDigit(this.peek())) { // number: TODO: negative number, floating point number(maybe)
	    return this.getNumberToken();
	}
	if(this.peek()==='(') { // left paren
	    return this.poll();
	}
	if(this.peek()===')') { // right paren
	    return this.poll();
	}
	if(this.peek()===',') { // comma
	    return this.poll();
	}
	let acc = "";
	while(!this.isSpace(this.peek())) {
	    acc+=this.poll();
	}
	return acc;
    }
    public tokenize() : Array<string> {
	let ret : Array<string> = [];
	while(!this.isEof()) {
	    this.skipSpaces();
	    if(this.isEof())
		break;
	    ret.push(this.getToken());
	}
	return ret;
    }
}
