import type { KintoneQueryBufferInterface, ConjType } from './kintone-query-buffer-interface';

/**
 * internal expression of query
 */
export class KintoneQueryBuffer implements KintoneQueryBufferInterface {
  private readonly buffer: KintoneQueryBufferInterface[];

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
    const query = this.buffer
      .filter((b) => {
        const subQuery = b.toQuery(true);
        return subQuery !== '()' && subQuery !== '';
      })
      .reduce((prev, b) => {
        const subQuery = b.toQuery(true);
        if (prev === '') {
          return subQuery;
        }
        return `${prev} ${b.getConj()} ${subQuery}`;
      }, '');
    if (query === '') {
      return '';
    }
    if (hasParent && this.buffer.length > 1) {
      return `(${query})`;
    }
    return query;
  }
}
