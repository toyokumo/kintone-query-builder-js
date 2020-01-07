import KintoneQueryBufferInterface, {
  ConjType
} from "./kintone-query-buffer-interface";

export default class KintoneQueryBufferElement
  implements KintoneQueryBufferInterface {
  /**
   * @param data - minimum element ('x < 10' or 'y = 10' or 'name like "banana"')
   * @param conj
   */
  constructor(private data: string, private conj: ConjType) {}

  public getConj(): ConjType {
    return this.conj;
  }

  public toQuery(_hasParent: boolean): string {
    return this.data;
  }
}
