export type ConjType = 'and' | 'or' | null;

export interface KintoneQueryBufferInterface {
  getConj(): ConjType;

  toQuery(hasParent: boolean): string;
}
