import { Ast, ObjectNode } from "../types/Ast";

const delimeters = new Set([":", ";", "{", "}", ",", "<", ">"]);
const ignorable = new Set([" ", "\t", "\n"]);

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

  throw new Error("Property parsing not implemented");
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
