import { IToken } from "ebnf";

export default class KintoneQueryError extends Error {
  constructor(message?: string, public ast?: IToken) {
    super(message);
  }
}
