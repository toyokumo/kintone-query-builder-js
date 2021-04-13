import { KintoneQueryBuilder } from '../src/kintone-query-builder';
import type { Operator } from '../src/kintone-query-expression';
import { KintoneQueryExpression } from '../src/kintone-query-expression';

describe('Build Conditions', () => {
  it('build by where', () => {
    const query0 = new KintoneQueryBuilder().where('name', '=', 'hoge').build();
    expect(query0).toEqual('name = "hoge"');

    const query1 = new KintoneQueryBuilder().where('field1', '<', '100').where('$id', '!=', 50).build();
    expect(query1).toEqual('field1 < "100" and $id != 50');
  });

  it('build by andWhere', () => {
    const query0 = new KintoneQueryBuilder()
      .where('age', '>', 10)
      .andWhere('name', 'like', 'banana')
      .andWhere('name', '!=', 'banana')
      .build();
    expect(query0).toEqual('age > 10 and name like "banana" and name != "banana"');

    const query1 = new KintoneQueryBuilder().andWhere('x', '>', 10).build();
    expect(query1).toEqual('x > 10');
  });

  it('build by orWhere', () => {
    const query = new KintoneQueryBuilder().where('age', '=', 20).orWhere('name', '=', 'bob').build();
    expect(query).toEqual('age = 20 or name = "bob"');
  });

  it('build like condition', () => {
    const query = new KintoneQueryBuilder().where('name', 'like', 'hog').build();
    expect(query).toEqual('name like "hog"');
  });

  it('build in condition', () => {
    const query0 = new KintoneQueryBuilder().where('favorite', 'in', ['apple', 'banana', 'orange']).build();
    expect(query0).toEqual('favorite in ("apple","banana","orange")');

    const query1 = new KintoneQueryBuilder().where('num', 'in', [1, 2, 4]).build();
    expect(query1).toEqual('num in (1,2,4)');

    const query2 = new KintoneQueryBuilder().where('favorite', 'not in', ['kiwi', 'cherry']).build();
    expect(query2).toEqual('favorite not in ("kiwi","cherry")');
  });

  it.each([
    ['user', '=', 'LOGINUSER()', 'user = LOGINUSER()'],
    ['org', '=', 'PRIMARY_ORGANIZATION()', 'org = PRIMARY_ORGANIZATION()'],
    ['time', '=', 'NOW()', 'time = NOW()'],
    ['time', '=', 'TODAY()', 'time = TODAY()'],
    ['time', '<', 'FROM_TODAY(5,DAYS)', 'time < FROM_TODAY(5,DAYS)'],
    ['time', '<', 'FROM_TODAY(5, DAYS)', 'time < FROM_TODAY(5, DAYS)'], // allow space
    ['time', '<', 'FROM_TODAY(5,   DAYS)', 'time < FROM_TODAY(5,   DAYS)'], // allow spaces
    ['time', '<', 'FROM_TODAY(-15,DAYS)', 'time < FROM_TODAY(-15,DAYS)'],
    ['time', '<', 'FROM_TODAY(-15, DAYS)', 'time < FROM_TODAY(-15, DAYS)'], // allow space
    ['time', '<', 'FROM_TODAY(-15,   DAYS)', 'time < FROM_TODAY(-15,   DAYS)'], // allow spaces
    ['time', '=', 'THIS_WEEK(SUNDAY)', 'time = THIS_WEEK(SUNDAY)'],
    ['time', '=', 'THIS_WEEK()', 'time = THIS_WEEK()'],
    ['time', '=', 'LAST_WEEK(SUNDAY)', 'time = LAST_WEEK(SUNDAY)'],
    ['time', '=', 'LAST_WEEK()', 'time = LAST_WEEK()'],
    ['time', '=', 'THIS_MONTH()', 'time = THIS_MONTH()'],
    ['time', '=', 'THIS_MONTH(LAST)', 'time = THIS_MONTH(LAST)'],
    ['time', '=', 'THIS_MONTH(1)', 'time = THIS_MONTH(1)'],
    ['time', '=', 'THIS_MONTH(81)', 'time = "THIS_MONTH(81)"'],
    ['time', '=', 'LAST_MONTH()', 'time = LAST_MONTH()'],
    ['time', '=', 'LAST_MONTH(LAST)', 'time = LAST_MONTH(LAST)'],
    ['time', '=', 'LAST_MONTH(1)', 'time = LAST_MONTH(1)'],
    ['time', '=', 'LAST_MONTH(81)', 'time = "LAST_MONTH(81)"'],
    ['time', '=', 'THIS_YEAR()', 'time = THIS_YEAR()'],
  ])('build condition with function', (a, b, c, expected) => {
    const query = new KintoneQueryBuilder().where(a, b as Operator, c).build();
    expect(query).toEqual(expected);
  });
});

describe('Build Order-by', () => {
  it('build single sorter', () => {
    const query0 = new KintoneQueryBuilder().orderBy('id', 'asc').build();
    expect(query0).toEqual('order by id asc');

    const query1 = new KintoneQueryBuilder().orderBy('id').build();
    expect(query1).toEqual('order by id');
  });

  it('build multi sorter', () => {
    const query = new KintoneQueryBuilder()
      .orderBy('$id', 'desc')
      .orderBy('name', 'asc')
      .orderBy('age', 'desc')
      .orderBy('address')
      .build();
    expect(query).toEqual('order by $id desc,name asc,age desc,address');
  });

  it('clear order-by', () => {
    const query = new KintoneQueryBuilder().orderBy('id', 'asc').orderBy(null).build();
    expect(query).toEqual('');
  });
});

describe('Build Limit', () => {
  it('build limit', () => {
    const query = new KintoneQueryBuilder().limit(10).build();
    expect(query).toEqual('limit 10');
  });

  it('clear limit', () => {
    const query = new KintoneQueryBuilder().limit(10).limit(null).build();
    expect(query).toEqual('');
  });

  it('override limit', () => {
    const builder = new KintoneQueryBuilder().where('age', '>', 20);
    const query0 = builder.limit(10).build();
    expect(query0).toEqual('age > 20 limit 10');
    const query1 = builder.limit(20).build();
    expect(query1).toEqual('age > 20 limit 20');
  });
});

describe('Build Offset', () => {
  it('build offset', () => {
    const query = new KintoneQueryBuilder().offset(30).build();
    expect(query).toEqual('offset 30');
  });

  it('clear offset', () => {
    const query = new KintoneQueryBuilder().offset(30).offset(null).build();
    expect(query).toEqual('');
  });

  it('override offset', () => {
    const builder = new KintoneQueryBuilder().where('age', '>', 20);
    const query0 = builder.offset(10).build();
    expect(query0).toEqual('age > 20 offset 10');
    const query1 = builder.offset(20).build();
    expect(query1).toEqual('age > 20 offset 20');
  });
});

describe('Build Quoted Query', () => {
  it('build query with double quote', () => {
    const query0 = new KintoneQueryBuilder().where('name', '=', 'ho"ge').build();
    expect(query0).toEqual('name = "ho\\"ge"');

    const query1 = new KintoneQueryBuilder().where('name', 'in', ['ho"ge', 'po"ga', 'piga"""']).build();
    expect(query1).toEqual('name in ("ho\\"ge","po\\"ga","piga\\"\\"\\"")');
  });
});

describe('Build Complex Query', () => {
  it('build same query regardless of method order', () => {
    const query1 = new KintoneQueryBuilder().orderBy('$id', 'desc').limit(50).where('age', '>', '20').build();
    const query0 = new KintoneQueryBuilder().where('age', '>', '20').orderBy('$id', 'desc').limit(50).build();
    expect(query0).toEqual(query1);
  });

  it('build or-and condition', () => {
    const query = new KintoneQueryBuilder()
      .where(new KintoneQueryExpression().where('foo', '=', 20).orWhere('bar', '=', 20))
      .where(new KintoneQueryExpression().where('pog', '=', 30).orWhere('puga', '=', 30))
      .build();
    expect(query).toEqual('(foo = 20 or bar = 20) and (pog = 30 or puga = 30)');
  });

  it('build and-or condition', () => {
    const query = new KintoneQueryBuilder()
      .where(new KintoneQueryExpression().where('a', '<', 1).andWhere('b', '<', 1))
      .orWhere(new KintoneQueryExpression().where('c', '<', 1).andWhere('d', '<', 1))
      .build();
    expect(query).toEqual('(a < 1 and b < 1) or (c < 1 and d < 1)');
  });

  it('build deep condition', () => {
    const query = new KintoneQueryBuilder()
      .where(
        new KintoneQueryExpression()
          .where(new KintoneQueryExpression().where('a', '=', 1).andWhere('b', '=', 1))
          .orWhere('c', '=', 1),
      )
      .andWhere('d', '=', 1)
      .build();
    expect(query).toEqual('((a = 1 and b = 1) or c = 1) and d = 1');
  });

  it('build empty', () => {
    const query = new KintoneQueryBuilder().build();
    expect(query).toEqual('');
  });

  it('build from multi empty condition', () => {
    const query = new KintoneQueryBuilder()
      .where(new KintoneQueryExpression())
      .where(new KintoneQueryExpression())
      .where(new KintoneQueryExpression())
      .build();
    expect(query).toEqual('');
  });

  it('build from expr', () => {
    const query = new KintoneQueryBuilder().where(new KintoneQueryExpression().where('x', '<', 1)).build();
    expect(query).toEqual('x < 1');
  });

  it('build deep and condition', () => {
    const query = new KintoneQueryBuilder()
      .where(
        new KintoneQueryExpression()
          .where(
            new KintoneQueryExpression()
              .where(new KintoneQueryExpression().where('a', '<', 10).where('x', '<', 100))
              .where('b', '<', 30),
          )
          .where('c', '<', 20),
      )
      .where('d', '<', 10)
      .build();
    expect(query).toEqual('(((a < 10 and x < 100) and b < 30) and c < 20) and d < 10');
  });

  it('remove empty condition', () => {
    const query = new KintoneQueryBuilder()
      .where(new KintoneQueryExpression())
      .where(new KintoneQueryExpression().where('x', '<', 10))
      .build();
    expect(query).toEqual('x < 10');
  });
});
