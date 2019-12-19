import KintoneQueryBuilder from "../src/kintone-query-builder";
import KintoneQueryExpr from "../src/kintone-query-expr";

describe("Query test", () => {
    it("testWhere", () => {
        const builder = new KintoneQueryBuilder();
        const query = builder.where('name', '=', 'hoge').build();
        expect(query).toEqual('name = "hoge"');
    });

    it("testOrderBy", () => {
        const builder = new KintoneQueryBuilder();
        const query = builder.orderBy('id', 'asc').build();
        expect(query).toEqual('order by id asc');
    });

    it('testLimit', () => {
        const builder = new KintoneQueryBuilder();
        const query = builder.limit(10).build();
        expect(query).toEqual('limit 10');
    });

    it('testOffset', () => {
        const builder = new KintoneQueryBuilder();
        const query = builder.offset(30).build();
        expect(query).toEqual('offset 30');
    });

    it('testMethodChainOrder', () => {
        const query1 = new KintoneQueryBuilder()
            .orderBy('$id', 'desc')
            .limit(50)
            .where('age', '>', '20')
            .build();
        const query0 = new KintoneQueryBuilder()
            .where('age', '>', '20')
            .orderBy('$id', 'desc')
            .limit(50)
            .build();
        expect(query0).toEqual(query1);
    });

    it('testLike', () => {
        const query = new KintoneQueryBuilder().where('name', 'like', 'hog').build();
        expect(query).toEqual('name like "hog"');
    });

    it('testIn', () => {
        const query0 = new KintoneQueryBuilder()
            .where('favorite', 'in', ['apple', 'banana', 'orange'])
            .build();
        expect(query0).toEqual('favorite in ("apple","banana","orange")');

        const query1 = new KintoneQueryBuilder()
            .where('num', 'in', [1, 2, 4])
            .build();
        expect(query1).toEqual('num in (1,2,4)');

        const query2 = new KintoneQueryBuilder()
            .where('favorite', 'not in', ['kiwi', 'cherry'])
            .build();
        expect(query2).toEqual('favorite not in ("kiwi","cherry")');
    });

    it('testAndWhere', () => {
        const query0 = new KintoneQueryBuilder()
            .where('age', '>', 10)
            .andWhere('name', 'like', 'banana')
            .andWhere('name', '!=', 'banana')
            .build();
        expect(query0).toEqual('age > 10 and name like "banana" and name != "banana"');

        const query1 = new KintoneQueryBuilder().andWhere('x', '>', 10).build();
        expect(query1).toEqual('x > 10')
    });

    it('testOrWhere', () => {
        const query = new KintoneQueryBuilder()
            .where('age', '=', 20)
            .orWhere('name', '=', 'bob')
            .build();
        expect(query).toEqual('age = 20 or name = "bob"');
    });

    it('testOrderByChain', () => {
        const query = new KintoneQueryBuilder()
            .orderBy('$id', 'desc')
            .orderBy('name', 'asc')
            .orderBy('age', 'desc')
            .build();
        expect(query).toEqual('order by $id desc,name asc,age desc');
    });

    it('testFunctionQuery', () => {
        const tests = [
            ['user', '=', 'LOGINUSER()', 'user = LOGINUSER()'],
            ['org', '=', 'PRIMARY_ORGANIZATION()', 'org = PRIMARY_ORGANIZATION()'],
            ['time', '=', 'NOW()', 'time = NOW()'],
            ['time', '=', 'TODAY()', 'time = TODAY()'],
            ['time', '<', 'FROM_TODAY(5,DAYS)', 'time < FROM_TODAY(5,DAYS)'],
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
            ['time', '=', 'THIS_YEAR()', 'time = THIS_YEAR()']
        ];

        for (const test of tests) {
            const query = new KintoneQueryBuilder().where(test[0], test[1], test[2]).build();
            expect(query).toEqual(test[3]);
        }
    });

    it('testComplicatedWhere', () => {
        const query0 = new KintoneQueryBuilder()
            .where('x', '<', 1)
            .where('y', '<', 2)
            .where('z', '<', 1)
            .build();
        expect(query0).toEqual('x < 1 and y < 2 and z < 1');

// A and (B or C)
        const query1 = new KintoneQueryBuilder()
            .where('huga', '<', 1)
            .where(
                new KintoneQueryExpr()
                    .where('piga', '<', 1)
                    .orWhere('fuga', '<', 1)
            )
            .build();
        expect(query1).toEqual('huga < 1 and (piga < 1 or fuga < 1)');

// (A and B) or (C and D)
        const query2 = new KintoneQueryBuilder()
            .where(
                new KintoneQueryExpr()
                    .where('a', '<', 1)
                    .andWhere('b', '<', 1)
            )
            .orWhere(
                new KintoneQueryExpr()
                    .where('c', '<', 1)
                    .andWhere('d', '<', 1)
            )
            .build();
        expect(query2).toEqual('(a < 1 and b < 1) or (c < 1 and d < 1)');

// (((A and B) or C) and D)
        const query3 = new KintoneQueryBuilder()
            .where(
                new KintoneQueryExpr()
                    .where(
                        new KintoneQueryExpr()
                            .where('a', '=', 1)
                            .andWhere('b', '=', 1)
                    )
                    .orWhere('c', '=', 1)
            )
            .andWhere('d', '=', 1)
            .build();
        expect(query3).toEqual('((a = 1 and b = 1) or c = 1) and d = 1');

        const query4 = new KintoneQueryBuilder().build();
        expect(query4).toEqual('');

        const query5 = new KintoneQueryBuilder()
            .where(new KintoneQueryExpr())
            .where(new KintoneQueryExpr())
            .where(new KintoneQueryExpr())
            .build();
        expect(query5).toEqual('');

        const query6 = new KintoneQueryBuilder()
            .where(new KintoneQueryExpr().where('x', '<', 1))
            .build();
        expect(query6).toEqual('(x < 1)');

        const query7 = new KintoneQueryBuilder()
            .where(new KintoneQueryExpr())
            .build();
        expect(query7).toEqual('');

        const query8 = new KintoneQueryBuilder()
            .where(
                new KintoneQueryExpr()
                    .where('foo', '=', 20)
                    .orWhere('bar', '=', 20)
            )
            .where(
                new KintoneQueryExpr()
                    .where('pog', '=', 30)
                    .orWhere('puga', '=', 30)
            )
            .build();
        expect(query8).toEqual('(foo = 20 or bar = 20) and (pog = 30 or puga = 30)');

        const query9 = new KintoneQueryBuilder()
            .where(
                new KintoneQueryExpr()
                    .where(
                        new KintoneQueryExpr()
                            .where(
                                new KintoneQueryExpr()
                                    .where('a', '<', 10)
                                    .where('x', '<', 100)
                            )
                            .where('b', '<', 30)
                    )
                    .where('c', '<', 20)
            )
            .where('d', '<', 10)
            .build();
        expect(query9).toEqual('(((a < 10 and x < 100) and b < 30) and c < 20) and d < 10');

        const query10 = new KintoneQueryBuilder()
            .where(new KintoneQueryExpr())
            .where(new KintoneQueryExpr().where('x', '<', 10))
            .build();
        expect(query10).toEqual('(x < 10)');

        const query11 = new KintoneQueryBuilder()
            .where(new KintoneQueryExpr())
            .andWhere(new KintoneQueryExpr().where('x', '<', 10))
            .build();
        expect(query11).toEqual('(x < 10)');
    });

    it('testEscape', () => {
        const query0 = new KintoneQueryBuilder()
            .where('name', '=', 'ho"ge')
            .build();
        expect(query0).toEqual('name = "ho\\"ge"');
        const query1 = new KintoneQueryBuilder()
            .where('name', 'in', ['ho"ge', 'po"ga', 'piga"""'])
            .build();
        expect(query1).toEqual('name in ("ho\\"ge","po\\"ga","piga\\"\\"\\"")');
    });

    it('testOffsetTwice', () => {
        const builder = new KintoneQueryBuilder().where('age', '>', 20);
        const query0 = builder.offset(10).build();
        expect(query0).toEqual('age > 20 offset 10');
        const query1 = builder.offset(20).build();
        expect(query1).toEqual('age > 20 offset 20');
    });

    it('testLimitTwice', () => {
        const builder = new KintoneQueryBuilder().where('age', '>', 20);
        const query0 = builder.limit(10).build();
        expect(query0).toEqual('age > 20 limit 10');
        const query1 = builder.limit(20).build();
        expect(query1).toEqual('age > 20 limit 20');
    });
});

