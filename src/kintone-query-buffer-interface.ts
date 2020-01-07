export type ConjType = "and" | "or" | null;

export default interface KintoneQueryBufferInterface {
  getConj(): ConjType;

  toQuery(hasParent: boolean): string;
}
