import {
  ArrayNode,
  ObjectNode,
  PrimitiveNode,
  RecordNode,
} from "../../types/Ast";
import { ParserState } from "../state/ParserState";
import { parseRecord } from "./record";

describe("parseRecord", () => {
  it("parses a string key", () => {
    const state = new ParserState(`Record<string, number>`);

    const parsed = parseRecord(state);

    expect(parsed.key.type).toEqual("primitive");
    expect(parsed.key.valueType).toEqual("string");
  });

  it("parses a number key", () => {
    const state = new ParserState(`Record<number, boolean>`);

    const parsed = parseRecord(state);

    expect(parsed.key.type).toEqual("primitive");
    expect(parsed.key.valueType).toEqual("number");
  });

  it("does not support boolean keys", () => {
    const state = new ParserState(`Record<boolean, boolean>`);

    const parse = () => parseRecord(state);

    expect(parse).toThrow(
      "Record keys must be either string or number, got 'boolean'"
    );
  });

  it("does not support symbol keys", () => {
    const state = new ParserState(`Record<symbol, boolean>`);

    const parse = () => parseRecord(state);

    expect(parse).toThrow("Unknown primitive symbol 'symbol'");
  });

  it("parses a primitive value", () => {
    const state = new ParserState(`Record<string, boolean>`);

    const value = parseRecord(state).value as PrimitiveNode;

    expect(value.type).toEqual("primitive");
    expect(value.valueType).toEqual("boolean");
  });

  it("parses rules for primitive values", () => {
    const state = new ParserState(`Record<string, string <email>>`);

    const value = parseRecord(state).value as PrimitiveNode;

    expect(value.rules.length).toEqual(1);
  });

  it("parses an array of primitives", () => {
    const state = new ParserState(`Record<string, number[]>`);

    const arrValue = parseRecord(state).value as ArrayNode;
    const value = arrValue.value as PrimitiveNode;

    expect(arrValue.type).toEqual("array");
    expect(value.type).toEqual("primitive");
    expect(value.valueType).toEqual("number");
  });

  it("parses rules for an array of primitives", () => {
    const state = new ParserState(`Record<string, number[] <int, positive>>`);

    const arrValue = parseRecord(state).value as ArrayNode;
    const value = arrValue.value as PrimitiveNode;

    expect(value.rules.length).toEqual(2);
  });

  it("parses an object value", () => {
    const state = new ParserState(`Record<string, { a: string; b: number }>`);

    const value = parseRecord(state).value as ObjectNode;

    expect(value.type).toEqual("object");
    expect(value.properties.length).toEqual(2);
  });

  it("parses an array of objects", () => {
    const state = new ParserState(`Record<string, { a: string }[]>`);

    const arrValue = parseRecord(state).value as ArrayNode;
    const value = arrValue.value as ObjectNode;

    expect(arrValue.type).toEqual("array");
    expect(value.type).toEqual("object");
    expect(value.properties.length).toEqual(1);
  });

  it("parses a two dimensional Record", () => {
    const state = new ParserState(`Record<string, Record<number, boolean>>`);

    const record0 = parseRecord(state);
    const record1 = record0.value as RecordNode;
    const value = record1.value as PrimitiveNode;

    expect(record0.type).toEqual("record");
    expect(record1.type).toEqual("record");
    expect(value.valueType).toEqual("boolean");
  });
});
