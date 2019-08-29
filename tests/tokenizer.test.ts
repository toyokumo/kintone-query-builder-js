import { KintoneQueryTokenizer, KintoneQueryToken } from "../src/tokenizer";

function unwrapTokens(tokens: Array<KintoneQueryToken>): Array<string> {
    return tokens.map(t => t.token);
}

function makeKintoneQueryToken(token: string, lineNumber: number, columnNumber: number): KintoneQueryToken {
    return { token: token, lineNumber: lineNumber, columnNumber: columnNumber };
}

describe('tokenize', function() {
    it('=', function() {
        let result1 = new KintoneQueryTokenizer('A = 1').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', '=', '1']);
        let result2 = new KintoneQueryTokenizer('文字列_0 = "テスト"').tokenize();
        expect(unwrapTokens(result2)).toEqual(['文字列_0', '=', '"テスト"']);
    });
    it('!=', function() {
        let result1 = new KintoneQueryTokenizer('A != 1').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', '!=', '1']);
        let result2 = new KintoneQueryTokenizer('文字列_0 = "テスト"').tokenize();
        expect(unwrapTokens(result2)).toEqual(['文字列_0', '=', '"テスト"']);
    });
    it('>', function() {
        let result = new KintoneQueryTokenizer('数値_0 > 10').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '>', '10']);
    });
    it('<', function() {
        let result = new KintoneQueryTokenizer('数値_0 < 10').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '<', '10']);
    });
    it('>=', function() {
        let result = new KintoneQueryTokenizer('数値_0 >= 10').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '>=', '10']);
    });
    it('<=', function() {
        let result = new KintoneQueryTokenizer('数値_0 <= 10').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '<=', '10']);
    });
    it('in', function() {
        let result1 = new KintoneQueryTokenizer('A in (1,2,3)').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', 'in', '(', '1', ',', '2', ',', '3', ')']);
        let result2 = new KintoneQueryTokenizer('ドロップダウン_0 in ("A", "B")').tokenize();
        expect(unwrapTokens(result2)).toEqual(['ドロップダウン_0', 'in', '(', '"A"', ",", '"B"', ')']);
    });
    it('not in', function() {
        let result1 = new KintoneQueryTokenizer('A in (1,2,3)').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', 'in', '(', '1', ',', '2', ',', '3', ')']);
        let result2 = new KintoneQueryTokenizer('ドロップダウン_0 not in ("A", "B")').tokenize();
        expect(unwrapTokens(result2)).toEqual(['ドロップダウン_0', 'not', 'in', '(', '"A"', ",", '"B"', ')']);
    });
    it('like', function() {
        let result1 = new KintoneQueryTokenizer('A like "hoge   hoge"').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', 'like', '"hoge   hoge"']);
        let result2 = new KintoneQueryTokenizer('文字列_0 like "テスト"').tokenize();
        expect(unwrapTokens(result2)).toEqual(['文字列_0', 'like', '"テスト"']);
    });
    it('not like', function() {
        let result1 = new KintoneQueryTokenizer('A not like "hoge   hoge"').tokenize();
        expect(unwrapTokens(result1)).toEqual(['A', 'not', 'like', '"hoge   hoge"']);
        let result2 = new KintoneQueryTokenizer('文字列_0 not like "テスト"').tokenize();
        expect(unwrapTokens(result2)).toEqual(['文字列_0', 'not', 'like', '"テスト"']);
    });
    it('or', function() {
        let result = new KintoneQueryTokenizer('数値_0 < 10 or 数値_0 > 2').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '<', '10', 'or', '数値_0', '>', '2']);
    });
    it('and', function() {
        let result = new KintoneQueryTokenizer('数値_0 >= 10 and 数値_0 <= 20').tokenize();
        expect(unwrapTokens(result)).toEqual(['数値_0', '>=', '10', 'and', '数値_0', '<=', '20']);
    });
    it('paren', function() {
        let result1 = new KintoneQueryTokenizer("( A = 1 or B = 2)").tokenize();
        expect(unwrapTokens(result1)).toEqual(["(", "A", "=", "1", "or", "B", "=", "2", ")"]);
        let result2 = new KintoneQueryTokenizer("( (A = 1 ) or (B =     2))").tokenize();
        expect(unwrapTokens(result2)).toEqual(["(", "(", "A", "=", "1", ")", "or", "(", "B", "=", "2", ")", ")"]);
    });
    it('orderBy', function() {
        let result1 = new KintoneQueryTokenizer("order by hoge").tokenize();
        expect(unwrapTokens(result1)).toEqual(["order", "by", "hoge"]);
        let result2 = new KintoneQueryTokenizer("A like \"hoge\" order by A asc, B asc").tokenize();
        expect(unwrapTokens(result2)).toEqual(["A", "like", "\"hoge\"", "order", "by", "A", "asc", ",", "B", "asc"]);
    });
    it("metadata (lineNumber, columnNumber)", function() {
        let result1 = new KintoneQueryTokenizer("A like \"hoge\" order by A asc, B asc").tokenize();
        expect(result1).toEqual([
            makeKintoneQueryToken("A", 1, 0),
            makeKintoneQueryToken("like", 1, 2),
            makeKintoneQueryToken("\"hoge\"", 1, 7),
            makeKintoneQueryToken("order", 1, 14),
            makeKintoneQueryToken("by", 1, 20),
            makeKintoneQueryToken("A", 1, 23),
            makeKintoneQueryToken("asc", 1, 25),
            makeKintoneQueryToken(",", 1, 28),
            makeKintoneQueryToken("B", 1, 30),
            makeKintoneQueryToken("asc", 1, 32)
        ]);
        let result2 = new KintoneQueryTokenizer("A = 1 and \nB = 3").tokenize();
        expect(result2).toEqual([
            makeKintoneQueryToken("A", 1, 0),
            makeKintoneQueryToken("=", 1, 2),
            makeKintoneQueryToken("1", 1, 4),
            makeKintoneQueryToken("and", 1, 6),
            makeKintoneQueryToken("B", 2, 0),
            makeKintoneQueryToken("=", 2, 2),
            makeKintoneQueryToken("3", 2, 4)
        ]);
    });
});
