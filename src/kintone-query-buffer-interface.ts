export type ConjType = 'and'|'or'|null

export default interface KintoneQueryBufferInterface {
    getConj(): ConjType;
    toQuery(hasParen: Boolean): string;
}
