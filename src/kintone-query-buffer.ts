import KintoneQueryBufferInterface, {
  ConjType
} from "./kintone-query-buffer-interface";

/**
 * internal expression of query
 */
export default class KintoneQueryBuffer implements KintoneQueryBufferInterface {
  public readonly buffer: KintoneQueryBufferInterface[];

  constructor(private conj: ConjType = null) {
    this.buffer = [];
  }

  public getConj(): ConjType {
    return this.conj;
  }

  public setConj(conj: ConjType): void {
    this.conj = conj;
  }

  public getBuffer(): KintoneQueryBufferInterface[] {
    return this.buffer;
  }

  public append(obj: KintoneQueryBufferInterface): void {
    this.buffer.push(obj);
  }

  public isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  public toQuery(hasParent = false): string {
    let query = "";

    for (let i = 0; i < this.buffer.length; i++) {
      const subQuery = this.buffer[i].toQuery(true);
      if (subQuery === "()" || subQuery === "") {
        continue;
      }
      if (i === 0) {
        query += subQuery;
      } else {
        query += ` ${this.buffer[i].getConj()} ${subQuery}`;
      }
    }
    if (query === "") {
      return "";
    }
    if (hasParent && this.buffer.length > 1) {
      return `(${query})`;
    }
    return query;
  }
}
