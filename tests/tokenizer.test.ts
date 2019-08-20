import { Tokenizer } from "../src/tokenizer";

describe('tokenize', function () {
    it('=', function() {
	let result = new Tokenizer('A = 1').tokenize();
	expect(result).toEqual(['A', '=', '1']);
    });
    it('!=', function () {
	let result = new Tokenizer('A != 1').tokenize();
	expect(result).toEqual(['A', '!=', '1']);
    });
});
