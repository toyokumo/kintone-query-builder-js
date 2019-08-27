import { KintoneQueryTokenizer } from './tokenizer';
import { KintoneQueryParser } from "./parser";

//console.log(new KintoneQueryTokenizer('field like "TypeScript"').tokenize());

//console.log(new KintoneQueryParser('( (A = 1 ) or (B =     2))').parse().query);

console.log(new KintoneQueryTokenizer('order by hoge').tokenize());

console.log(new KintoneQueryParser('order by hoge').parse());

