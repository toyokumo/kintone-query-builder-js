import { KintoneQueryTokenizer } from "../src/tokenizer";

describe('tokenize', function () {
    it('=', function() {
	let result = new KintoneQueryTokenizer('A = 1').tokenize();
	expect(result).toEqual(['A', '=', '1']);
    });
    it('!=', function () {
	let result = new KintoneQueryTokenizer('A != 1').tokenize();
	expect(result).toEqual(['A', '!=', '1']);
    });
    it('in', function () {
	let result = new KintoneQueryTokenizer('A in (1,2,3)').tokenize();
	expect(result).toEqual(['A', 'in', '(', '1', ',', '2', ',', '3', ')']);
    });
    it('like', function() {
	let result = new KintoneQueryTokenizer('A like "hoge   hoge"').tokenize();
	expect(result).toEqual(['A', 'like', '"hoge   hoge"']);
    });
});
