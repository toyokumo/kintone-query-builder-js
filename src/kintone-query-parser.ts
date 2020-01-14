import {Grammars} from 'ebnf';
import KintoneQueryBuilder from "./kintone-query-builder";
import ConditionsParser from "./parser/conditions-parser";
import OrderByParser from "./parser/order-by-parser";
import LimitParser from "./parser/limit-parser";
import OffsetParser from "./parser/offset-parser";
import ParserInterface from "./parser/parser-interface";
import KintoneQueryError from "./kintone-query-error";

const queryBnf =
    `query           ::= SPACES? conditions? order_by_clause? limit_clause? offset_clause? SPACES?

conditions      ::= and_conditions (SPACES 'or' SPACES and_conditions)*
and_conditions  ::= parenethesized (SPACES 'and' SPACES parenethesized)*
parenethesized  ::= condition | '(' conditions ')'
condition       ::= comp_condition | in_condition | like_condition
comp_condition  ::= field comp_operator value
in_condition    ::= field in_operator values
like_condition  ::= field like_operator string
field           ::= '$id' | (FIELD_FIRST (FIELD_FIRST | [0-9])*) ('.' (FIELD_FIRST (FIELD_FIRST | [0-9])*))?
FIELD_FIRST     ::= [a-z] | [A-Z] | '_' | [#x80-#xFFFF]
comp_operator   ::= SPACES? ('!'? '=' | '>=' | '<=' | '>' | '<') SPACES?
in_operator     ::= SPACES ('not' SPACES)? 'in' SPACES
like_operator   ::= SPACES ('not' SPACES)? 'like' SPACES
values          ::= '(' SPACES? value (SPACES? ',' SPACES? value)* SPACES? ')'
value           ::= number | string | function

order_by_clause ::= SPACES? 'order by' SPACES sorter (SPACES? ',' SPACES? sorter)*
sorter          ::= field (SPACES sort_order)?
sort_order      ::= 'asc' | 'desc'

limit_clause    ::= SPACES? 'limit' SPACES integer

offset_clause   ::= SPACES? 'offset' SPACES integer

SPACES          ::= #x20+
integer         ::= '-'? ('0' | [1-9] [0-9]*)
number          ::= integer ('.' [0-9]+)?
string          ::= '"' (([#x20-#x21] | [#x23-#x5B] | [#x5D-#xFFFF]) | #x5C (#x22 | #x5C | #x2F | #x62 | #x66 | #x6E | #x72 | #x74 | #x75 HEXDIG HEXDIG HEXDIG HEXDIG))* '"'
HEXDIG          ::= [a-fA-F0-9]
function        ::= 'LOGINUSER()' | 'PRIMARY_ORGANIZATION()' | 'NOW()' | 'TODAY()' | 'FROM_TODAY(' integer ',' SPACES? DAY_SPAN_UNIT ')' | 'THIS_WEEK(' DAY_OF_WEEK? ')' | 'LAST_WEEK(' DAY_OF_WEEK? ')' | 'THIS_MONTH(' DAY_OF_MONTH? ')' | 'LAST_MONTH(' DAY_OF_MONTH? ')' | 'THIS_YEAR()'

DAY_SPAN_UNIT   ::= 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS'
DAY_OF_WEEK     ::= 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
DAY_OF_MONTH    ::= [1-2] [0-9] | '3' [0-1] | [1-9] | 'LAST'
`;

const elementParsers = new Map<string, ParserInterface>([
    ['conditions', new ConditionsParser()],
    ['order_by_clause', new OrderByParser()],
    ['limit_clause', new LimitParser()],
    ['offset_clause', new OffsetParser()],
]);

const queryParser = new Grammars.W3C.Parser(queryBnf, null);

export default class KintoneQueryParser {
    public parse(query: string): KintoneQueryBuilder {
        if (query === '') {
            return new KintoneQueryBuilder();
        }
        const ast = queryParser.getAST(query);
        if (!ast) {
            throw new KintoneQueryError(`failed to parse query "${query}"`);
        }
        if (ast.errors.length > 0) {
            throw new KintoneQueryError(ast.errors[0].message, ast);
        }
        const builder = new KintoneQueryBuilder();
        for (let child of ast.children) {
            elementParsers.get(child.type)!.apply(builder, child);
        }
        return builder;
    }
}
