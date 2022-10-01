import { enforceExhaustive } from "../switch";
import { Ast, ObjectNode, PropertyNode, ValueNode } from "../types/Ast";

const primitiveList = ["string", "number"] as const;

const delimeters = new Set([":", ";", "{", "}", "[", "]", "<", ">"]);
const whitespace = new Set([" ", "\t", "\n"]);
const primitives = new Set(primitiveList);

type PrimitiveSymbol = typeof primitiveList[number];

function isPrimitiveSymbol(s: string): s is PrimitiveSymbol {
  return primitives.has(s as PrimitiveSymbol);
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

  currentCharacter() {
    return this.s.substr(this.index, 1);
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

    if (delimeters.has(c)) {
      this.nextDelimeterToken(c);
      return;
    }

    if (isAlpha(c)) {
      this.nextSymbolToken(c);
      return;
    }

    throw new Error(`Unexpected token '${c}'`);
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

    let value: ValueNode;

    const tokenType = state.tokenType();
    switch (tokenType) {
      case TokenType.Symbol: {
        const token = state.token();
        if (!isPrimitiveSymbol(token)) {
          throw new Error(`Unknown symbol '${token}'`);
        }
        value = { type: "primitive", valueType: token };
        break;
      }
      case TokenType.Delimeter: {
        if (state.token() !== "{") {
          throw new Error(`Unexpected token '${state.token()}'`);
        }
        value = parseObject(state);
        break;
      }
      case TokenType.None:
        throw new Error(`Expected end of template`);
      default:
        enforceExhaustive(tokenType, `Unexpected token type`);
    }

    state.nextToken();

    if (state.tokenType() === TokenType.Delimeter && state.token() === "[") {
      // Likely array modifier, for example:
      //
      //    a: string[]
      //
      state.nextToken();
      if (state.tokenType() !== TokenType.Delimeter || state.token() !== "]") {
        throw new Error(`Expected ']'`);
      }
      properties.push({
        type: "property",
        key,
        value: { type: "array", value },
      });
      state.nextToken();
    } else {
      properties.push({ type: "property", key, value });
    }

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

export function astFromString(s: string): Ast {
  const state = new State(s);
  const out = parseObject(state);

  state.nextToken();
  if (state.tokenType() !== TokenType.None) {
    throw new Error("Expected end of template");
  }

  return out;
}
