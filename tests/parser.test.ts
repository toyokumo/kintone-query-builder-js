import { KintoneQueryParser } from "../src/parser";

describe('parser', function() {
    it('=', function() {
        let result1 = new KintoneQueryParser('A = 1').parse();
        expect(result1).toEqual({ query: 'A = 1' });
        let result2 = new KintoneQueryParser('文字列_0 = "テスト"').parse();
        expect(result2).toEqual({ query: '文字列_0 = "テスト"' });
    });
    it('!=', function() {
        let result1 = new KintoneQueryParser('A != 1').parse();
        expect(result1).toEqual({ query: 'A != 1' });
        let result2 = new KintoneQueryParser('文字列_0 = "テスト"').parse();
        expect(result2).toEqual({ query: '文字列_0 = "テスト"' });
    });
    it('>', function() {
        let result = new KintoneQueryParser('数値_0 > 10').parse();
        expect(result).toEqual({ query: '数値_0 > 10' });
    });
    it('<', function() {
        let result = new KintoneQueryParser('数値_0 < 10').parse();
        expect(result).toEqual({ query: '数値_0 < 10' });
    });
    it('>=', function() {
        let result = new KintoneQueryParser('数値_0 >= 10').parse();
        expect(result).toEqual({ query: '数値_0 >= 10' });
    });
    it('<=', function() {
        let result = new KintoneQueryParser('数値_0 <= 10').parse();
        expect(result).toEqual({ query: '数値_0 <= 10' });
    });
    it('in', function() {
        let result1 = new KintoneQueryParser('A in (1,2,3)').parse();
        expect(result1).toEqual({ query: 'A in (1,2,3)' });
        let result2 = new KintoneQueryParser('ドロップダウン_0 in ("A", "B")').parse();
        expect(result2).toEqual({ query: 'ドロップダウン_0 in ("A", "B")' });
    });
    it('not in', function() {
        let result1 = new KintoneQueryParser('A in (1,2,3)').parse();
        expect(result1).toEqual({ query: 'A in (1,2,3)' });
        let result2 = new KintoneQueryParser('ドロップダウン_0 not in ("A", "B")').parse();
        expect(result2).toEqual({ query: 'ドロップダウン_0 not in ("A", "B")' });
    });
    it('like', function() {
        let result1 = new KintoneQueryParser('A like "hoge   hoge"').parse();
        expect(result1).toEqual({ query: 'A like "hoge   hoge"' });
        let result2 = new KintoneQueryParser('文字列_0 like "テスト"').parse();
        expect(result2).toEqual({ query: '文字列_0 like "テスト"' });
    });
    it('not like', function() {
        let result2 = new KintoneQueryParser('文字列_0 not like "テスト"').parse();
        expect(result2).toEqual({ query: '文字列_0 like "テスト"' });
    });
    it('or', function() {
        let result = new KintoneQueryParser('数値_0 < 10 or 数値_0 > 2').parse();
        expect(result).toEqual({ query: '数値_0 < 10 or 数値_0 > 2' });
    });
    it('and', function() {
        let result = new KintoneQueryParser('数値_0 >= 10 and 数値_0 <= 20').parse();
        expect(result).toEqual({ query: '数値_0 >= 10 and 数値_0 <= 20' });
    });
});
