import KintoneQueryBufferInterface, {
  ConjType
} from "./kintone-query-buffer-interface";
import KintoneQueryError from "./kintone-query-error";

export type Operator =
  | "="
  | "<"
  | ">"
  | "<="
  | ">="
  | "!="
  | "in"
  | "not in"
  | "like"
  | "not like";

export type ValueType = string | number | (string | number)[];

export default class KintoneQueryBufferElement
  implements KintoneQueryBufferInterface {
  /**
   * @param field - kintone app field name
   * @param operator
   * @param value
   * @param conj
   */
  constructor(
    public field: string,
    public operator: string,
    public value: ValueType,
    private conj: ConjType
  ) {}

  public getConj(): ConjType {
    return this.conj;
  }

  public toQuery(_hasParent: boolean): string {
    if (this.operator === "in" || this.operator === "not in") {
      if (!Array.isArray(this.value)) {
        throw new KintoneQueryError(
          "Invalid value type: In case operator === 'in', value must be array, but given " +
            typeof this.value
        );
      }
    }
    return `${this.field} ${
      this.operator
    } ${KintoneQueryBufferElement.valueToString(this.value)}`;
  }

  private static funcCheck(s: string): boolean {
    const regExps = [
      /LOGINUSER\(\)/,
      /PRIMARY_ORGANIZATION\(\)/,
      /NOW\(\)/,
      /TODAY\(\)/,
      /FROM_TODAY\(-?\d+,DAYS\)/,
      /FROM_TODAY\(-?\d+,WEEKS\)/,
      /FROM_TODAY\(-?\d+,MONTHS\)/,
      /FROM_TODAY\(-?\d+,YEARS\)/,
      /THIS_WEEK\(\)/,
      /THIS_WEEK\(SUNDAY\)/,
      /THIS_WEEK\(MONDAY\)/,
      /THIS_WEEK\(TUESDAY\)/,
      /THIS_WEEK\(WEDNESDAY\)/,
      /THIS_WEEK\(THURSDAY\)/,
      /THIS_WEEK\(FRIDAY\)/,
      /THIS_WEEK\(SATURDAY\)/,
      /LAST_WEEK\(\)/,
      /LAST_WEEK\(SUNDAY\)/,
      /LAST_WEEK\(MONDAY\)/,
      /LAST_WEEK\(TUESDAY\)/,
      /LAST_WEEK\(WEDNESDAY\)/,
      /LAST_WEEK\(THURSDAY\)/,
      /LAST_WEEK\(FRIDAY\)/,
      /LAST_WEEK\(SATURDAY\)/,
      /THIS_MONTH\(\)/,
      /THIS_MONTH\(([1-9]|([1-2][0-9])|(3[0-1]))\)/,
      /THIS_MONTH\(LAST\)/,
      /LAST_MONTH\(\)/,
      /LAST_MONTH\(([1-9]|([1-2][0-9])|(3[0-1]))\)/,
      /LAST_MONTH\(LAST\)/,
      /THIS_YEAR\(\)/
    ];

    return regExps.some(r => s.match(r));
  }

  private static escapeDoubleQuote(s: string): string {
    return s.split('"').join('\\"');
  }

  private static valueToString(value: ValueType): string {
    if (typeof value === "string") {
      if (KintoneQueryBufferElement.funcCheck(value)) {
        return value;
      }
      return '"' + KintoneQueryBufferElement.escapeDoubleQuote(value) + '"';
    }
    if (typeof value === "number") {
      return "" + value;
    }
    return (
      "(" + value.map(KintoneQueryBufferElement.valueToString).join(",") + ")"
    );
  }
}
