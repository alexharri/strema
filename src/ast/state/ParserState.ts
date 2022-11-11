import { TokenType } from "../token";

const delimeters = new Set([
  ":",
  ";",
  "{",
  "}",
  "[",
  "]",
  "<",
  ">",
  "(",
  ")",
  ",",
  "=",
  '"',
  "?",
]);
const whitespace = new Set([" ", "\t", "\n"]);

function isAlpha(c: string) {
  return /^[a-zA-Z_]$/.test(c);
}

function isNumeric(c: string) {
  return /^[0-9]$/.test(c);
}

export class ParserState {
  private index = 0;
  private _token: string = "";
  private _tokenType: TokenType = TokenType.None;

  constructor(private s: string) {
    this.nextToken();
  }

  // When comparing `state.token` to a literal, TypeScript narrows the
  // type of `state.token` to the literal.
  //
  // `state.nextToken` modifies `state.token`, but TypeScript does not
  // know that and so does not 'un-narrow' the type. This produces type
  // errors when we compare `state.token` to other literals.
  //
  // Making `state.token()` a method allows us to opt out of type
  // narrowing.
  //
  // See https://github.com/Microsoft/TypeScript/issues/9998
  token(): string {
    return this._token;
  }

  tokenType(): TokenType {
    return this._tokenType;
  }

  atDelimeter(delimeter: string) {
    return this._tokenType === TokenType.Delimeter && this._token === delimeter;
  }

  nextToken() {
    this._tokenType = TokenType.None;
    this._token = "";

    while (this.canIgnoreCurrentCharacter()) {
      this.next();
    }

    if (this.isAtEnd()) {
      return;
    }

    const c = this.currentCharacter();

    if (c === '"') {
      this.nextStringToken();
      return;
    }

    if (delimeters.has(c)) {
      this.nextDelimeterToken(c);
      return;
    }

    if (isNumeric(c)) {
      this.nextNumericToken(c);
      return;
    }

    if (isAlpha(c)) {
      this.nextSymbolToken(c);
      return;
    }

    throw new Error(`Unexpected token '${c}'`);
  }

  private currentCharacter() {
    return this.s.substr(this.index, 1);
  }

  private characterAtOffset(offset: number) {
    return this.s.substr(this.index + offset, 1);
  }

  private nextSymbolToken(c: string) {
    let s = "";
    while (isAlpha(c)) {
      s += c;
      this.next();
      c = this.currentCharacter();
    }
    this._tokenType = TokenType.Symbol;
    this._token = s;
  }

  /**
   * @todo support decimals
   */
  private nextNumericToken(c: string) {
    let s = "";
    while (isNumeric(c)) {
      s += c;
      this.next();
      c = this.currentCharacter();
    }
    this._tokenType = TokenType.Number;
    this._token = s;
  }

  private nextStringToken() {
    this.next();

    let s = "";
    let c = this.currentCharacter();

    while (true) {
      if (c === "") {
        throw new Error("Unexpected end of template");
      }

      if (c === '"') {
        this.next();
        break;
      }

      if (c === "\\" && this.characterAtOffset(1) === '"') {
        c = '"';
        this.next();
      }

      s += c;
      this.next();
      c = this.currentCharacter();
    }
    this._tokenType = TokenType.String;
    this._token = s;
  }

  private nextDelimeterToken(c: string) {
    this._tokenType = TokenType.Delimeter;
    this._token = c;
    this.next();
  }

  private canIgnoreCurrentCharacter() {
    const c = this.currentCharacter();
    return whitespace.has(c);
  }

  private isAtEnd() {
    return this.currentCharacter() === "";
  }

  private next() {
    this.index++;
  }
}
