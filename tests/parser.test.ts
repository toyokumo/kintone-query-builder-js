import { KintoneQueryParser } from "../src/parser";

function generate_simple_mock(query: string) {
    return { query: query, orderBy: { otype: 0, fields: [] }, limit: 500, offset: 0 };
}

describe('parser', function() {
    it('=', function() {
        let result1 = new KintoneQueryParser('A = 1').parse();
        expect(result1).toEqual(generate_simple_mock('A = 1'));
        let result2 = new KintoneQueryParser('文字列_0 = "テスト"').parse();
        expect(result2).toEqual(generate_simple_mock('文字列_0 = "テスト"'));
    });
    it('!=', function() {
        let result1 = new KintoneQueryParser('A != 1').parse();
        expect(result1).toEqual(generate_simple_mock('A != 1'));
        let result2 = new KintoneQueryParser('文字列_0 = "テスト"').parse();
        expect(result2).toEqual(generate_simple_mock('文字列_0 = "テスト"'));
    });
    it('>', function() {
        let result = new KintoneQueryParser('数値_0 > 10').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 > 10'));
    });
    it('<', function() {
        let result = new KintoneQueryParser('数値_0 < 10').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 < 10'));
    });
    it('>=', function() {
        let result = new KintoneQueryParser('数値_0 >= 10').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 >= 10'));
    });
    it('<=', function() {
        let result = new KintoneQueryParser('数値_0 <= 10').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 <= 10'));
    });
    it('in', function() {
        let result1 = new KintoneQueryParser('A in (1,2,3)').parse();
        expect(result1).toEqual(generate_simple_mock('A in (1, 2, 3)'));
        let result2 = new KintoneQueryParser('ドロップダウン_0 in ("A", "B")').parse();
        expect(result2).toEqual(generate_simple_mock('ドロップダウン_0 in ("A", "B")'));
    });
    it('not in', function() {
        let result1 = new KintoneQueryParser('A not in (1,2,3)').parse();
        expect(result1).toEqual(generate_simple_mock('A not in (1, 2, 3)'));
        let result2 = new KintoneQueryParser('ドロップダウン_0 not in ("A", "B")').parse();
        expect(result2).toEqual(generate_simple_mock('ドロップダウン_0 not in ("A", "B")'));
    });
    it('like', function() {
        let result1 = new KintoneQueryParser('A like "hoge   hoge"').parse();
        expect(result1).toEqual(generate_simple_mock('A like "hoge   hoge"'));
        let result2 = new KintoneQueryParser('文字列_0 like "テスト"').parse();
        expect(result2).toEqual(generate_simple_mock('文字列_0 like "テスト"'));
    });
    it('not like', function() {
        let result2 = new KintoneQueryParser('文字列_0 not like "テスト"').parse();
        expect(result2).toEqual(generate_simple_mock('文字列_0 not like "テスト"'));
    });
    it('or', function() {
        let result = new KintoneQueryParser('数値_0 < 10 or 数値_0 > 2').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 < 10 or 数値_0 > 2'));
    });
    it('and', function() {
        let result = new KintoneQueryParser('数値_0 >= 10 and 数値_0 <= 20').parse();
        expect(result).toEqual(generate_simple_mock('数値_0 >= 10 and 数値_0 <= 20'));
    });
    it('paren', function() {
        let result1 = new KintoneQueryParser("( A = 1 or B = 2)").parse();
        expect(result1).toEqual(generate_simple_mock("(A = 1 or B = 2)"));
        let result2 = new KintoneQueryParser("( (A = 1 ) or (B =     2))").parse();
        expect(result2).toEqual(generate_simple_mock("((A = 1) or (B = 2))"));
        let result3 = new KintoneQueryParser("A = 1 and B = 2").parse();
        expect(result3).toEqual(generate_simple_mock("A = 1 and B = 2"));
        let result4 = new KintoneQueryParser("A = 1 and (B = 2 and C = 3)").parse();
        expect(result4).toEqual(generate_simple_mock("A = 1 and (B = 2 and C = 3)"));
    });
    it('nested', function() {
        let result1 = new KintoneQueryParser("(((A = 1        and        B = 2)      ) or (   C = 3))").parse();
        expect(result1).toEqual(generate_simple_mock("(((A = 1 and B = 2)) or (C = 3))"));
        let result2 = new KintoneQueryParser("((((A = 1  and D = 4)       and        B = 2)      ) or (   C = 3))").parse();
        expect(result2).toEqual(generate_simple_mock("((((A = 1 and D = 4) and B = 2)) or (C = 3))"));
        let result3 = new KintoneQueryParser("((A = 1 and B =             2)        ) or (C    = 3 and (D = 4 and (E = 5  and F = 6    )    ))").parse();
        expect(result3).toEqual(generate_simple_mock("((A = 1 and B = 2)) or (C = 3 and (D = 4 and (E = 5 and F = 6)))"));
    });
});
