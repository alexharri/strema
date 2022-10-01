import { Ast, ObjectNode, PropertyNode } from "../types/Ast";

const delimeters = new Set([":", ";", "{", "}", ",", "<", ">"]);
const ignorable = new Set([" ", "\t", "\n"]);
const primitiveSymbols = ["string", "number"] as const;
const primitiveSymbolSet = new Set(primitiveSymbols);

type PrimitiveSymbol = typeof primitiveSymbols[number];

function isPrimitiveSymbol(s: string): s is PrimitiveSymbol {
  return primitiveSymbolSet.has(s as PrimitiveSymbol);
}

function isAlpha(c: string) {
  return /^[a-zA-Z]$/.test(c);
}

enum TokenType {
  None = 0,
  Delimeter = 1,
  Symbol = 2,
}

class State {
  private index = 0;
  public _token: string = "";
  public _tokenType: TokenType = TokenType.None;

  token(): string {
    return this._token;
  }
  tokenType(): TokenType {
    return this._tokenType as TokenType;
  }

  constructor(private s: string) {
    this.nextToken();
  }

  public nextToken() {
    this._tokenType = TokenType.None;
    this._token = "";

    while (this.canIgnoreCurrentCharacter()) {
      this.next();
    }

    if (this.isAtEnd()) {
      return;
    }

    const c = this.currentCharacter();

    if (delimeters.has(c)) {
      this._tokenType = TokenType.Delimeter;
      this._token = c;
      this.next();
      return;
    }

    if (isAlpha(c)) {
      let s = "";
      let c = this.currentCharacter();
      while (isAlpha(c)) {
        s += c;
        this.next();
        c = this.currentCharacter();
      }
      this._tokenType = TokenType.Symbol;
      this._token = s;
      return;
    }

    throw new Error(`Unexpected token '${c}'`);
  }

  private canIgnoreCurrentCharacter() {
    const c = this.currentCharacter();
    return ignorable.has(c);
  }

  private isAtEnd() {
    return this.currentCharacter() === "";
  }

  private next() {
    this.index++;
  }

  public currentCharacter() {
    return this.s.substr(this.index, 1);
  }
}

function parseKey(state: State): string {
  if (state.tokenType() === TokenType.None) {
    throw new Error(`Unexpected end of template`);
  }
  if (state.tokenType() !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token()}'`);
  }
  return state.token();
}

function parseProperties(state: State): PropertyNode[] {
  let findMore = true;
  const properties: PropertyNode[] = [];

  while (findMore) {
    const key = parseKey(state);

    state.nextToken();

    if (state.tokenType() !== TokenType.Delimeter || state.token() !== ":") {
      throw new Error(`Expected ':'`);
    }

    state.nextToken();

    const tokenType = state.tokenType();
    if (tokenType === TokenType.Symbol) {
      const token = state.token();
      if (!isPrimitiveSymbol(token)) {
        throw new Error(`Unknown symbol '${token}'`);
      }
      properties.push({
        type: "property",
        key,
        value: { type: "primitive", valueType: token },
      });
    } else if (tokenType === TokenType.Delimeter) {
      if (state.token() !== "{") {
        throw new Error(`Unexpected token '${state.token()}'`);
      }

      // Object property
      const objectProperty = parseObject(state);
      properties.push({
        type: "property",
        key,
        value: objectProperty,
      });
    } else if (tokenType === TokenType.None) {
      throw new Error(`Expected end of template`);
    } else {
      throw new Error(`Expected token type '${tokenType}'`);
    }

    state.nextToken();

    /** @todo check for rules */

    // Skip over ';'
    if (state.tokenType() === TokenType.Delimeter && state.token() === ";") {
      state.nextToken();
    }

    if (state.tokenType() === TokenType.Delimeter && state.token() === "}") {
      findMore = false;
    }
  }

  return properties;
}

function parseObject(state: State): ObjectNode {
  if (state.tokenType() !== TokenType.Delimeter || state.token() !== "{") {
    throw new Error(`Expected '{'`);
  }

  state.nextToken();

  if (state.tokenType() === TokenType.Delimeter && state.token() === "}") {
    // Immediately closed object
    return { type: "object", properties: [] };
  }

  const properties = parseProperties(state);
  return { type: "object", properties };
}

export function createAst(s: string): Ast {
  const state = new State(s);
  const out = parseObject(state);

  state.nextToken();
  if (state.tokenType() !== TokenType.None) {
    throw new Error("Expected end of template");
  }

  return out;
}
