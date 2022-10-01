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
  public token: string = "";
  public tokenType: TokenType = TokenType.None;

  constructor(private s: string) {}

  public nextToken() {
    this.tokenType = TokenType.None;
    this.token = "";

    while (this.canIgnoreCurrentCharacter()) {
      this.next();
    }

    if (this.isAtEnd()) {
      return;
    }

    const c = this.currentCharacter();

    if (delimeters.has(c)) {
      this.tokenType = TokenType.Delimeter;
      this.token = c;
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
      this.tokenType = TokenType.Symbol;
      this.token = s;
      return;
    }
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
  if (state.tokenType !== TokenType.Symbol) {
    throw new Error(`Unexpected token '${state.token}'`);
  }
  return state.token;
}

function parseProperties(state: State): PropertyNode[] {
  let findMore = true;
  const properties: PropertyNode[] = [];

  while (findMore) {
    const key = parseKey(state);

    state.nextToken();
    let tokenType = state.tokenType;
    let token = state.token;

    if (tokenType !== TokenType.Delimeter || token !== ":") {
      throw new Error(`Expected ':'`);
    }

    state.nextToken();
    tokenType = state.tokenType;
    token = state.token;

    if (tokenType === TokenType.Symbol) {
      if (!isPrimitiveSymbol(token)) {
        throw new Error(`Unknown symbol '${token}'`);
      }
      properties.push({
        type: "property",
        key,
        value: { type: "primitive", valueType: token },
      });
    } else if (tokenType === TokenType.Delimeter) {
      if (token !== "{") {
        throw new Error(`Unexpected token '${token}'`);
      }

      // Object property
      const objectProperty = parseObject(state);
      properties.push({
        type: "property",
        key,
        value: objectProperty,
      });
    } else if (tokenType === TokenType.None) {
      throw new Error(`Expected end of file`);
    } else {
      throw new Error(`Expected token type '${tokenType}'`);
    }

    state.nextToken();
    tokenType = state.tokenType;
    token = state.token;

    /** @todo check for rules */

    // Skip over ';'
    if (tokenType === TokenType.Delimeter && token === ";") {
      state.nextToken();
      tokenType = state.tokenType;
      token = state.token;
    }

    if (tokenType === TokenType.Delimeter && token === "}") {
      findMore = false;
    }
  }

  return properties;
}

function parseObject(state: State): ObjectNode {
  // Invoking 'state.nextToken()' does not un-narrow 'state.token'
  // once re-evaluated. We use the local 'token' variable to make
  // TypeScript not narrow 'state.token'.
  //
  // See https://github.com/Microsoft/TypeScript/issues/9998
  let token = state.token;
  if (state.tokenType !== TokenType.Delimeter || token !== "{") {
    throw new Error(`Expected {`);
  }

  state.nextToken();

  token = state.token;
  if (state.tokenType === TokenType.Delimeter && token === "}") {
    // Immediately closed object
    return { type: "object", properties: [] };
  }

  const properties = parseProperties(state);
  return { type: "object", properties };
}

export function createAst(s: string): Ast {
  const state = new State(s);
  state.nextToken();
  const out = parseObject(state);

  state.nextToken();
  if (state.tokenType !== TokenType.None) {
    throw new Error("Expected end of template");
  }

  return out;
}
