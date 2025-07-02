import { KintoneQueryParser } from '../src/kintone-query-parser';

describe('Parse Monadic Condition', () => {
  const parser = new KintoneQueryParser();
  it('parse empty', () => {
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
  ])('parse compare-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field like "val"', 'field like "val"'],
    ['   フィールド  like  "値"   ', 'フィールド like "値"'],
    [' f__1 not     like  ""   ', 'f__1 not like ""'],
    [' f__1 not like "\\"string\\""', 'f__1 not like "\\"string\\""'],
  ])('parse like-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field in ("")', 'field in ("")'],
    ['フィールド in ("val",100,-1.25,"")', 'フィールド in ("val",100,-1.25,"")'],
    ['     f__1 not   in ( "\\"string"    ,   -0.001   ) ', 'f__1 not in ("\\"string",-0.001)'],
    ['field in (FROM_TODAY(1,DAYS),FROM_TODAY(2,DAYS))', 'field in (FROM_TODAY(1,DAYS),FROM_TODAY(2,DAYS))'],
  ])('parse in-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field is empty', 'field is empty'],
    ['フィールド is empty', 'フィールド is empty'],
    ['$id is empty', '$id is empty'],
    ['  field   is   empty  ', 'field is empty'],
    ['field is not empty', 'field is not empty'],
    ['フィールド is not empty', 'フィールド is not empty'],
    ['  field   is   not   empty  ', 'field is not empty'],
  ])('parse is-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field=LOGINUSER()', 'field = LOGINUSER()'],
    ['field=PRIMARY_ORGANIZATION()', 'field = PRIMARY_ORGANIZATION()'],
    ['field=NOW()', 'field = NOW()'],
    ['field=TODAY()', 'field = TODAY()'],
    ['field=YESTERDAY()', 'field = YESTERDAY()'],
    ['field=TOMORROW()', 'field = TOMORROW()'],
    ['field=FROM_TODAY(-1,DAYS)', 'field = FROM_TODAY(-1,DAYS)'],
    ['field=THIS_WEEK()', 'field = THIS_WEEK()'],
    ['field=THIS_WEEK(MONDAY)', 'field = THIS_WEEK(MONDAY)'],
    ['field=LAST_WEEK()', 'field = LAST_WEEK()'],
    ['field=LAST_WEEK(MONDAY)', 'field = LAST_WEEK(MONDAY)'],
    ['field=NEXT_WEEK()', 'field = NEXT_WEEK()'],
    ['field=NEXT_WEEK(THURSDAY)', 'field = NEXT_WEEK(THURSDAY)'],
    ['field=THIS_MONTH()', 'field = THIS_MONTH()'],
    ['field=THIS_MONTH(1)', 'field = THIS_MONTH(1)'],
    ['field=THIS_MONTH(LAST)', 'field = THIS_MONTH(LAST)'],
    ['field=LAST_MONTH()', 'field = LAST_MONTH()'],
    ['field=LAST_MONTH(1)', 'field = LAST_MONTH(1)'],
    ['field=LAST_MONTH(LAST)', 'field = LAST_MONTH(LAST)'],
    ['field=NEXT_MONTH()', 'field = NEXT_MONTH()'],
    ['field=NEXT_MONTH(31)', 'field = NEXT_MONTH(31)'],
    ['field=NEXT_MONTH(LAST)', 'field = NEXT_MONTH(LAST)'],
    ['field=THIS_YEAR()', 'field = THIS_YEAR()'],
    ['field=LAST_YEAR()', 'field = LAST_YEAR()'],
    ['field=NEXT_YEAR()', 'field = NEXT_YEAR()'],
  ])('parse function-query', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});

describe('Parse Combination Condition', () => {
  const parser = new KintoneQueryParser();
  it.each([
    ['field=123 and field2<=0', '(field = 123 and field2 <= 0)'],
    ['(field=123 and field2<=0)', '(field = 123 and field2 <= 0)'],
    ['(((field=123) and field2<=0))', '(field = 123 and field2 <= 0)'],
    ['field like "val" and フィールド in (0,1,2)', '(field like "val" and フィールド in (0,1,2))'],
    [
      '$id=123 and f1=123 and f2<TODAY() and f3!=THIS_YEAR()',
      '($id = 123 and f1 = 123 and f2 < TODAY() and f3 != THIS_YEAR())',
    ],
    [' field  =123  and  field2<= 0  ', '(field = 123 and field2 <= 0)'],
  ])('parse and-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field=123 or field2<=0', '(field = 123 or field2 <= 0)'],
    ['(field=123 or field2<=0)', '(field = 123 or field2 <= 0)'],
    ['(((field=123) or field2<=0))', '(field = 123 or field2 <= 0)'],
    ['field like "val" or フィールド in (0,1,2)', '(field like "val" or フィールド in (0,1,2))'],
    [
      '$id=123 or f1=123 or f2<TODAY() or f3!=THIS_YEAR()',
      '($id = 123 or f1 = 123 or f2 < TODAY() or f3 != THIS_YEAR())',
    ],
    [' field  =123  or  field2<= 0  ', '(field = 123 or field2 <= 0)'],
  ])('parse or-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['f1=1 and f2=2 or f3=3', '((f1 = 1 and f2 = 2) or f3 = 3)'],
    ['f1=1 or f2=2 and f3=3', '(f1 = 1 or (f2 = 2 and f3 = 3))'],
    ['(f1=1 or f2=2) and f3=3', '((f1 = 1 or f2 = 2) and f3 = 3)'],
    ['((f1=1 or f2=2) and f3=3) or (f4=4 and f5=5)', '(((f1 = 1 or f2 = 2) and f3 = 3) or (f4 = 4 and f5 = 5))'],
  ])('parse complex-condition', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});

describe('Parse Order-by', () => {
  const parser = new KintoneQueryParser();
  it.each([
    ['order by field asc', 'order by field asc'],
    ['order by フィールド desc', 'order by フィールド desc'],
    ['order by f__1', 'order by f__1'],
    ['  order by    field     asc ', 'order by field asc'],
  ])('parse monadic order-by', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['order by field asc, f2, $id desc', 'order by field asc,f2,$id desc'],
    ['order by f1,f2,f3', 'order by f1,f2,f3'],
    ['  order by  field   asc ,  f2  ,  $id   desc ', 'order by field asc,f2,$id desc'],
  ])('parse multi order-by', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});

describe('Parse Limit', () => {
  const parser = new KintoneQueryParser();
  it.each([
    ['limit 1', 'limit 1'],
    ['  limit   500 ', 'limit 500'],
  ])('parse limit', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});

describe('Parse Offset', () => {
  const parser = new KintoneQueryParser();
  it.each([
    ['offset 1', 'offset 1'],
    ['  offset   500 ', 'offset 500'],
  ])('parse offset', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});

describe('Parse complex query', () => {
  const parser = new KintoneQueryParser();
  it.each([
    ['order by field asc limit 1', 'order by field asc limit 1'],
    ['order by field desc offset 500', 'order by field desc offset 500'],
    ['order by field asc,f2 desc,f3 limit 1 offset 500', 'order by field asc,f2 desc,f3 limit 1 offset 500'],
    ['limit 1 offset 500', 'limit 1 offset 500'],
    [' order by  field   limit 1  offset  0 ', 'order by field limit 1 offset 0'],
  ])('parse no condition query', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });

  it.each([
    ['field=1 order by field asc limit 1', 'field = 1 order by field asc limit 1'],
    [
      '(f1=1 or f2=2) and f3=3 order by field asc limit 1',
      '((f1 = 1 or f2 = 2) and f3 = 3) order by field asc limit 1',
    ],
    [
      '((f1=1 or f2=2) and f3=3) or (f4=4 and f5=5) order by field asc,f2 desc,f3 limit 1 offset 500',
      '(((f1 = 1 or f2 = 2) and f3 = 3) or (f4 = 4 and f5 = 5)) order by field asc,f2 desc,f3 limit 1 offset 500',
    ],
  ])('parse condition query', (query, expected) => {
    expect(parser.parse(query).build()).toEqual(expected);
  });
});
