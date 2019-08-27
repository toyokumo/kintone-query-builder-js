import { KintoneQueryTokenizer } from "../src/tokenizer";

describe('tokenize', function() {
    it('=', function() {
        let result1 = new KintoneQueryTokenizer('A = 1').tokenize();
        expect(result1).toEqual(['A', '=', '1']);
        let result2 = new KintoneQueryTokenizer('文字列_0 = "テスト"').tokenize();
        expect(result2).toEqual(['文字列_0', '=', '"テスト"']);
    });
    it('!=', function() {
        let result1 = new KintoneQueryTokenizer('A != 1').tokenize();
        expect(result1).toEqual(['A', '!=', '1']);
        let result2 = new KintoneQueryTokenizer('文字列_0 = "テスト"').tokenize();
        expect(result2).toEqual(['文字列_0', '=', '"テスト"']);
    });
    it('>', function() {
        let result = new KintoneQueryTokenizer('数値_0 > 10').tokenize();
        expect(result).toEqual(['数値_0', '>', '10']);
    });
    it('<', function() {
        let result = new KintoneQueryTokenizer('数値_0 < 10').tokenize();
        expect(result).toEqual(['数値_0', '<', '10']);
    });
    it('>=', function() {
        let result = new KintoneQueryTokenizer('数値_0 >= 10').tokenize();
        expect(result).toEqual(['数値_0', '>=', '10']);
    });
    it('<=', function() {
        let result = new KintoneQueryTokenizer('数値_0 <= 10').tokenize();
        expect(result).toEqual(['数値_0', '<=', '10']);
    });
    it('in', function() {
        let result1 = new KintoneQueryTokenizer('A in (1,2,3)').tokenize();
        expect(result1).toEqual(['A', 'in', '(', '1', ',', '2', ',', '3', ')']);
        let result2 = new KintoneQueryTokenizer('ドロップダウン_0 in ("A", "B")').tokenize();
        expect(result2).toEqual(['ドロップダウン_0', 'in', '(', '"A"', ",", '"B"', ')']);
    });
    it('not in', function() {
        let result1 = new KintoneQueryTokenizer('A in (1,2,3)').tokenize();
        expect(result1).toEqual(['A', 'in', '(', '1', ',', '2', ',', '3', ')']);
        let result2 = new KintoneQueryTokenizer('ドロップダウン_0 not in ("A", "B")').tokenize();
        expect(result2).toEqual(['ドロップダウン_0', 'not', 'in', '(', '"A"', ",", '"B"', ')']);
    });
    it('like', function() {
        let result1 = new KintoneQueryTokenizer('A like "hoge   hoge"').tokenize();
        expect(result1).toEqual(['A', 'like', '"hoge   hoge"']);
        let result2 = new KintoneQueryTokenizer('文字列_0 like "テスト"').tokenize();
        expect(result2).toEqual(['文字列_0', 'like', '"テスト"']);
    });
    it('not like', function() {
        let result2 = new KintoneQueryTokenizer('文字列_0 not like "テスト"').tokenize();
        expect(result2).toEqual(['文字列_0', 'not', 'like', '"テスト"']);
    });
    it('or', function() {
        let result = new KintoneQueryTokenizer('数値_0 < 10 or 数値_0 > 2').tokenize();
        expect(result).toEqual(['数値_0', '<', '10', 'or', '数値_0', '>', '2']);
    });
    it('and', function() {
        let result = new KintoneQueryTokenizer('数値_0 >= 10 and 数値_0 <= 20').tokenize();
        expect(result).toEqual(['数値_0', '>=', '10', 'and', '数値_0', '<=', '20']);
    });
    it('paren', function() {
        let result1 = new KintoneQueryTokenizer("( A = 1 or B = 2)").tokenize();
        expect(result1).toEqual(["(", "A", "=", "1", "or", "B", "=", "2", ")"]);
        let result2 = new KintoneQueryTokenizer("( (A = 1 ) or (B =     2))").tokenize();
        expect(result2).toEqual(["(", "(", "A", "=", "1", ")", "or", "(", "B", "=", "2", ")", ")"]);
    });
    it('orderBy', function() {
        let result1 = new KintoneQueryTokenizer("order by hoge").tokenize();
        expect(result1).toEqual(["order", "by", "hoge"]);
        let result2 = new KintoneQueryTokenizer("A like \"hoge\" order by A asc, B asc").tokenize();
        expect(result2).toEqual(["A", "like", "\"hoge\"", "order", "by", "A", "asc", ",", "B", "asc"]);
    });
});
