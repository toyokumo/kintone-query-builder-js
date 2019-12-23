import KintoneQueryParser from "../src/kintone-query-parser";

describe("monadic condition test", () => {
    const parser = new KintoneQueryParser();
    it("empty condition case", () => {
        expect(parser.parse('').build()).toEqual('');
    });

    it.each([
        ['field=123', 'field = 123'],
        ['(field=123)', 'field = 123'],
        ['((field=123))', 'field = 123'],
        ['field._related_field=123', 'field._related_field = 123'],
        ['フィールド != -590', 'フィールド != -590'],
        ['field<=123.45', 'field <= 123.45'],
        ['$id>=590', '$id >= 590'],
        ['  field     >  "abcd."   ', 'field > "abcd."'],
        ['field<"abcd.\\"\\""', 'field < "abcd.\\"\\""'],
        ['field<FROM_TODAY(10,DAYS)', 'field < FROM_TODAY(10,DAYS)'],
    ])("compare-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['field like "val"', 'field like "val"'],
        ['   フィールド  like  "値"   ', 'フィールド like "値"'],
        [' f__1 not     like  ""   ', 'f__1 not like ""'],
        [' f__1 not like "\\"string\\""', 'f__1 not like "\\"string\\""'],
    ])("like-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['field in ("")', 'field in ("")'],
        ['フィールド in ("val",100,-1.25,"")', 'フィールド in ("val",100,-1.25,"")'],
        ['     f__1 not   in ( "\\"string"    ,   -0.001   ) ', 'f__1 not in ("\\"string",-0.001)'],
        ['field in (FROM_TODAY(1,DAYS),FROM_TODAY(2,DAYS))', 'field in (FROM_TODAY(1,DAYS),FROM_TODAY(2,DAYS))'],
    ])("in-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['field=LOGINUSER()', 'field = LOGINUSER()'],
        ['field=PRIMARY_ORGANIZATION()', 'field = PRIMARY_ORGANIZATION()'],
        ['field=NOW()', 'field = NOW()'],
        ['field=TODAY()', 'field = TODAY()'],
        ['field=FROM_TODAY(-1,DAYS)', 'field = FROM_TODAY(-1,DAYS)'],
        ['field=THIS_WEEK()', 'field = THIS_WEEK()'],
        ['field=THIS_WEEK(MONDAY)', 'field = THIS_WEEK(MONDAY)'],
        ['field=LAST_WEEK()', 'field = LAST_WEEK()'],
        ['field=LAST_WEEK(MONDAY)', 'field = LAST_WEEK(MONDAY)'],
        ['field=THIS_MONTH()', 'field = THIS_MONTH()'],
        ['field=THIS_MONTH(1)', 'field = THIS_MONTH(1)'],
        ['field=THIS_MONTH(LAST)', 'field = THIS_MONTH(LAST)'],
        ['field=LAST_MONTH()', 'field = LAST_MONTH()'],
        ['field=LAST_MONTH(1)', 'field = LAST_MONTH(1)'],
        ['field=LAST_MONTH(LAST)', 'field = LAST_MONTH(LAST)'],
        ['field=THIS_YEAR()', 'field = THIS_YEAR()'],
    ])("function-query case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});

describe("combination condition test", () => {
    const parser = new KintoneQueryParser();
    it.each([
        ['field=123 and field2<=0', '(field = 123 and field2 <= 0)'],
        ['(field=123 and field2<=0)', '(field = 123 and field2 <= 0)'],
        ['(((field=123) and field2<=0))', '(field = 123 and field2 <= 0)'],
        ['field like "val" and フィールド in (0,1,2)', '(field like "val" and フィールド in (0,1,2))'],
        ['$id=123 and f1=123 and f2<TODAY() and f3!=THIS_YEAR()', '($id = 123 and f1 = 123 and f2 < TODAY() and f3 != THIS_YEAR())'],
        [' field  =123  and  field2<= 0  ', '(field = 123 and field2 <= 0)'],
    ])("and-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['field=123 or field2<=0', '(field = 123 or field2 <= 0)'],
        ['(field=123 or field2<=0)', '(field = 123 or field2 <= 0)'],
        ['(((field=123) or field2<=0))', '(field = 123 or field2 <= 0)'],
        ['field like "val" or フィールド in (0,1,2)', '(field like "val" or フィールド in (0,1,2))'],
        ['$id=123 or f1=123 or f2<TODAY() or f3!=THIS_YEAR()', '($id = 123 or f1 = 123 or f2 < TODAY() or f3 != THIS_YEAR())'],
        [' field  =123  or  field2<= 0  ', '(field = 123 or field2 <= 0)'],
    ])("or-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['f1=1 and f2=2 or f3=3', '((f1 = 1 and f2 = 2) or f3 = 3)'],
        ['f1=1 or f2=2 and f3=3', '(f1 = 1 or (f2 = 2 and f3 = 3))'],
        ['(f1=1 or f2=2) and f3=3', '((f1 = 1 or f2 = 2) and f3 = 3)'],
        ['((f1=1 or f2=2) and f3=3) or (f4=4 and f5=5)', '(((f1 = 1 or f2 = 2) and f3 = 3) or (f4 = 4 and f5 = 5))'],
    ])("complex-condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});

describe("order-by test", () => {
    const parser = new KintoneQueryParser();
    it.each([
        ['order by field asc', 'order by field asc'],
        ['order by フィールド desc', 'order by フィールド desc'],
        ['order by f__1', 'order by f__1'],
        ['  order by    field     asc ', 'order by field asc'],
    ])("monadic order-by case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['order by field asc, f2, $id desc', 'order by field asc,f2,$id desc'],
        ['order by f1,f2,f3', 'order by f1,f2,f3'],
        ['  order by  field   asc ,  f2  ,  $id   desc ', 'order by field asc,f2,$id desc'],
    ])("multi order-by case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});


describe("limit test", () => {
    const parser = new KintoneQueryParser();
    it.each([
        ['limit 1', 'limit 1'],
        ['  limit   500 ', 'limit 500'],
    ])("test", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});

describe("offset test", () => {
    const parser = new KintoneQueryParser();
    it.each([
        ['offset 1', 'offset 1'],
        ['  offset   500 ', 'offset 500'],
    ])("test", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});

describe("complex query test", () => {
    const parser = new KintoneQueryParser();
    it.each([
        ['order by field asc limit 1', 'order by field asc limit 1'],
        ['order by field desc offset 500', 'order by field desc offset 500'],
        ['order by field asc,f2 desc,f3 limit 1 offset 500', 'order by field asc,f2 desc,f3 limit 1 offset 500'],
        ['limit 1 offset 500', 'limit 1 offset 500'],
        [' order by  field   limit 1  offset  0 ', 'order by field limit 1 offset 0'],
    ])("no condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });

    it.each([
        ['field=1 order by field asc limit 1', 'field = 1 order by field asc limit 1'],
        ['(f1=1 or f2=2) and f3=3 order by field asc limit 1', '((f1 = 1 or f2 = 2) and f3 = 3) order by field asc limit 1'],
        ['((f1=1 or f2=2) and f3=3) or (f4=4 and f5=5) order by field asc,f2 desc,f3 limit 1 offset 500',
            '(((f1 = 1 or f2 = 2) and f3 = 3) or (f4 = 4 and f5 = 5)) order by field asc,f2 desc,f3 limit 1 offset 500'],
    ])("with condition case", (query, expected) => {
        expect(parser.parse(query).build()).toEqual(expected);
    });
});
