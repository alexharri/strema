'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * Use to enforce that every case in a switch has been matched:
 *
 * ```tsx
 * switch (value) {
 *    case A:
 *      // Do something
 *      break;
 *    case B:
 *      // Do something else
 *    default:
 *      enforceExhaustive(value);
 * }
 * ```
 *
 * If there are cases to be matched, the type of `value` will not
 * be assignable to `never` and a type error will be emitted.
 */
function enforceExhaustive(value, message) {
    if (message === void 0) { message = "Unexpected value"; }
    throw new Error("".concat(message, " '").concat(value, "'"));
}

function callNTimes(n, callback) {
    if (!Number.isFinite(n)) {
        throw new Error("Expected valid number, got '".concat(n, "'"));
    }
    if (n < 0)
        return;
    for (var i = 0; i < n; i++) {
        callback();
    }
}

var TokenType;
(function (TokenType) {
    TokenType[TokenType["None"] = 0] = "None";
    TokenType[TokenType["Delimeter"] = 1] = "Delimeter";
    TokenType[TokenType["Symbol"] = 2] = "Symbol";
    TokenType[TokenType["Number"] = 3] = "Number";
    TokenType[TokenType["String"] = 4] = "String";
})(TokenType || (TokenType = {}));

// So that the error message prints quotes around the value (like '"..."')
function quoteIfString(token, tokenType) {
    if (tokenType === TokenType.String) {
        token = "\"".concat(token, "\"");
    }
    return token;
}
function parseString(token, tokenType) {
    if (tokenType !== TokenType.String) {
        throw new Error("Expected string, got '".concat(token, "'"));
    }
    return token;
}
function parseNumber(token, tokenType) {
    if (tokenType !== TokenType.Number) {
        throw new Error("Expected number, got '".concat(quoteIfString(token, tokenType), "'"));
    }
    var value = Number(token);
    if (!Number.isFinite(value)) {
        throw new Error("Expected finite number, got '".concat(value, "'"));
    }
    return value;
}
function parseBoolean(token, tokenType) {
    if (tokenType !== TokenType.Symbol) {
        throw new Error("Expected boolean, got '".concat(quoteIfString(token, tokenType), "'"));
    }
    switch (token) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            throw new Error("Unexpected token '".concat(token, "', expected true or false"));
    }
}
function parseDefaultValue(state, primitiveType) {
    if (!state.atDelimeter("=")) {
        return null;
    }
    state.nextToken();
    var token = state.token();
    var tokenType = state.tokenType();
    state.nextToken();
    switch (primitiveType) {
        case "string":
            return parseString(token, tokenType);
        case "number":
            return parseNumber(token, tokenType);
        case "boolean":
            return parseBoolean(token, tokenType);
        default:
            enforceExhaustive(primitiveType, "Unexpected primitive type");
    }
}

var ruleTests = [
    {
        rule: "email",
        primitiveType: "string",
        requiresNumericArgument: false,
        toRule: function () { return ({ type: "email" }); },
    },
    {
        rule: "min",
        primitiveType: "string",
        requiresNumericArgument: true,
        toRule: function (arg) { return ({ type: "min", value: arg }); },
    },
    {
        rule: "max",
        primitiveType: "string",
        requiresNumericArgument: true,
        toRule: function (arg) { return ({ type: "max", value: arg }); },
    },
    {
        rule: "length",
        primitiveType: "string",
        requiresNumericArgument: true,
        toRule: function (arg) { return ({ type: "length", value: arg }); },
    },
    {
        rule: "uuid",
        primitiveType: "string",
        requiresNumericArgument: false,
        toRule: function () { return ({ type: "uuid" }); },
    },
    {
        rule: "positive",
        primitiveType: "number",
        requiresNumericArgument: false,
        toRule: function () { return ({ type: "positive" }); },
    },
    {
        rule: "int",
        primitiveType: "number",
        requiresNumericArgument: false,
        toRule: function () { return ({ type: "int" }); },
    },
    {
        rule: "min",
        primitiveType: "number",
        requiresNumericArgument: true,
        toRule: function (arg) { return ({ type: "min", value: arg }); },
    },
    {
        rule: "max",
        primitiveType: "number",
        requiresNumericArgument: true,
        toRule: function (arg) { return ({ type: "max", value: arg }); },
    },
];
var ruleTestsByTypeAndName = ruleTests.reduce(function (obj, ruleTest) {
    if (!obj[ruleTest.primitiveType]) {
        obj[ruleTest.primitiveType] = {};
    }
    obj[ruleTest.primitiveType][ruleTest.rule] = ruleTest;
    return obj;
}, {});
function resolveRule(primitiveType, rule, arg) {
    var _a;
    var hasArg = arg !== null;
    var ruleTest = (_a = ruleTestsByTypeAndName[primitiveType]) === null || _a === void 0 ? void 0 : _a[rule];
    if (!ruleTest) {
        throw new Error("Unknown ".concat(primitiveType, " rule '").concat(rule, "'"));
    }
    if (ruleTest.requiresNumericArgument && !hasArg) {
        throw new Error("Rule '".concat(rule, "' expects a single numeric argument."));
    }
    if (!ruleTest.requiresNumericArgument && hasArg) {
        throw new Error("Rule '".concat(rule, "' expects no arguments."));
    }
    return ruleTest.toRule(arg);
}

function parseRuleArgument(state) {
    if (!state.atDelimeter("(")) {
        return null;
    }
    state.nextToken();
    if (state.tokenType() !== TokenType.Number) {
        throw new Error("Expected numeric argument, got '".concat(state.token(), "'"));
    }
    var value = Number(state.token());
    state.nextToken();
    if (!Number.isFinite(value)) {
        throw new Error("Expected finite number, got '".concat(value, "'"));
    }
    if (!state.atDelimeter(")")) {
        throw new Error("Unexpected token '".concat(state.token(), "', expected ')'"));
    }
    state.nextToken();
    return value;
}
function parseRule(state, primitiveType) {
    // Rules are comprised of a symbol, optionally followed by a single
    // argument within parenthesis (like a function call):
    //
    //    - int
    //    - min(1)
    //
    // The rules are contained within '<>' and separated by a comma ','.
    //
    //    - <int>
    //    - <min(1)>
    //    - <int, min(0), max(10)>
    //
    // After parsing a rule, skip over the comma ',' if present.
    if (state.tokenType() !== TokenType.Symbol) {
        throw new Error("Expected rule name, got '".concat(state.token(), "'"));
    }
    var ruleName = state.token();
    state.nextToken();
    var arg = parseRuleArgument(state);
    var rule = resolveRule(primitiveType, ruleName, arg);
    return rule;
}
function parseRules(state, primitiveType) {
    var rules = [];
    if (!state.atDelimeter("<")) {
        return rules;
    }
    state.nextToken();
    while (!state.atDelimeter(">")) {
        var rule = parseRule(state, primitiveType);
        if (state.atDelimeter(",")) {
            state.nextToken();
        }
        else if (!state.atDelimeter(">")) {
            throw new Error("Expected ',' or '>', got '".concat(state.token(), "'"));
        }
        rules.push(rule);
    }
    state.nextToken();
    return rules;
}

function parseKey$1(state) {
    var value = parseValue(state);
    if (value.type !== "primitive") {
        throw new Error("Record keys must be either string or number, got '".concat(value.type, "'"));
    }
    switch (value.valueType) {
        case "string":
        case "number":
            break;
        default:
            throw new Error("Record keys must be either string or number, got '".concat(value.valueType, "'"));
    }
    return value;
}
function parseRecord(state) {
    if (state.token() !== "Record") {
        throw new Error("Unexpected token '".concat(state.token(), "'"));
    }
    state.nextToken();
    if (!state.atDelimeter("<")) {
        throw new Error("Expected '<', got '".concat(state.token(), "'"));
    }
    state.nextToken();
    var key = parseKey$1(state);
    if (!state.atDelimeter(",")) {
        throw new Error("Expected ',', got '".concat(state.token(), "'"));
    }
    state.nextToken();
    var value = parseArrayableValueAndRules(state, { optional: false });
    if (!state.atDelimeter(">")) {
        throw new Error("Expected '>', got '".concat(state.token(), "'"));
    }
    state.nextToken();
    return { type: "record", key: key, value: value };
}

var primitiveList = ["string", "number", "boolean"];
var primitives = new Set(primitiveList);
function isPrimitiveSymbol(s) {
    return primitives.has(s);
}
function parseValue(state) {
    var value;
    var tokenType = state.tokenType();
    switch (tokenType) {
        case TokenType.Symbol: {
            var token = state.token();
            if (token === "Record") {
                return parseRecord(state);
            }
            if (!isPrimitiveSymbol(token)) {
                throw new Error("Unknown primitive symbol '".concat(token, "'"));
            }
            value = {
                type: "primitive",
                valueType: token,
                rules: [],
                defaultValue: null,
                optional: false, // Optionality is set later in 'parseProperty'
            };
            state.nextToken();
            break;
        }
        case TokenType.Delimeter: {
            if (state.token() !== "{") {
                throw new Error("Unexpected token '".concat(state.token(), "'"));
            }
            value = parseObject(state);
            break;
        }
        case TokenType.None:
            throw new Error("Expected end of template");
        case TokenType.Number:
        case TokenType.String:
            throw new Error("Unexpected token type '".concat(tokenType, "'"));
        default:
            enforceExhaustive(tokenType, "Unexpected token type");
    }
    return value;
}

function parseKey(state) {
    if (state.tokenType() === TokenType.None) {
        throw new Error("Unexpected end of template");
    }
    if (state.tokenType() !== TokenType.Symbol) {
        throw new Error("Unexpected token '".concat(state.token(), "'"));
    }
    var key = state.token();
    state.nextToken();
    var optional = false;
    if (state.atDelimeter("?")) {
        optional = true;
        state.nextToken();
    }
    if (!state.atDelimeter(":")) {
        throw new Error("Expected ':'");
    }
    state.nextToken();
    return [key, optional];
}
/**
 * Parses array notation to determine the dimension of the array.
 *
 *  - `[]` resolves to 1
 *  - `[][]` resolves to 2
 *
 * If there is no array notation, 0 is returned
 */
function parseArrayDimension(state) {
    var dimension = 0;
    while (state.atDelimeter("[")) {
        state.nextToken();
        if (!state.atDelimeter("]")) {
            throw new Error("Expected ']'");
        }
        state.nextToken();
        dimension++;
    }
    return dimension;
}
function parseArrayableValueAndRules(state, _a) {
    var optional = _a.optional;
    var value = parseValue(state);
    var arrayDimension = parseArrayDimension(state);
    if (value.type === "primitive") {
        value.rules = parseRules(state, value.valueType);
        value.defaultValue = parseDefaultValue(state, value.valueType);
    }
    callNTimes(arrayDimension, function () {
        value = { type: "array", value: value, optional: false };
    });
    if (optional) {
        var type = value.type;
        switch (type) {
            case "object":
            case "array":
            case "primitive":
                value.optional = true;
                break;
            case "record":
                throw new Error("Type '".concat(type, "' cannot be optional"));
            default:
                enforceExhaustive(type);
        }
    }
    var requiredPrimitiveHasDefaultValue = value.type === "primitive" &&
        !value.optional &&
        value.defaultValue !== null;
    if (requiredPrimitiveHasDefaultValue) {
        throw new Error("Non-optional fields cannot have default values.");
    }
    return value;
}
function parseProperty(state) {
    var _a = parseKey(state), key = _a[0], optional = _a[1];
    var value = parseArrayableValueAndRules(state, { optional: optional });
    var property = { type: "property", key: key, value: value };
    return property;
}
function parseProperties(state) {
    var expectMoreProperties = true;
    var properties = [];
    while (expectMoreProperties) {
        var property = parseProperty(state);
        properties.push(property);
        var atPropertySeparator = state.atDelimeter(";");
        if (atPropertySeparator) {
            // We can just jump over property separators
            state.nextToken();
        }
        var atObjectClose = state.atDelimeter("}");
        if (atObjectClose) {
            expectMoreProperties = false;
        }
    }
    return properties;
}

function parseObject(state) {
    if (!state.atDelimeter("{")) {
        throw new Error("Expected '{'");
    }
    state.nextToken();
    if (state.atDelimeter("}")) {
        // Immediately closed object
        state.nextToken();
        return {
            type: "object",
            properties: [],
            optional: false,
            hasRequiredProperties: false,
        };
    }
    var properties = parseProperties(state);
    if (!state.atDelimeter("}")) {
        throw new Error("Unexpected token '".concat(state.token(), "'"));
    }
    state.nextToken();
    var hasRequiredProperties = !!properties.find(function (property) {
        var type = property.value.type;
        switch (type) {
            case "record":
                return false;
            case "object": {
                var _a = property.value, optional = _a.optional, hasRequiredProperties_1 = _a.hasRequiredProperties;
                return !optional && hasRequiredProperties_1;
            }
            case "array":
            case "primitive":
                return !property.value.optional;
            default:
                enforceExhaustive(type);
        }
    });
    return {
        type: "object",
        properties: properties,
        optional: false,
        hasRequiredProperties: hasRequiredProperties,
    };
}

var delimeters = new Set([
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
var whitespace = new Set([" ", "\t", "\n"]);
function isAlpha(c) {
    return /^[a-zA-Z_]$/.test(c);
}
function isNumeric(c) {
    return /^[0-9]$/.test(c);
}
var ParserState = /** @class */ (function () {
    function ParserState(s) {
        this.s = s;
        this.index = 0;
        this._token = "";
        this._tokenType = TokenType.None;
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
    ParserState.prototype.token = function () {
        return this._token;
    };
    ParserState.prototype.tokenType = function () {
        return this._tokenType;
    };
    ParserState.prototype.atDelimeter = function (delimeter) {
        return this._tokenType === TokenType.Delimeter && this._token === delimeter;
    };
    ParserState.prototype.nextToken = function () {
        this._tokenType = TokenType.None;
        this._token = "";
        while (this.canIgnoreCurrentCharacter()) {
            this.next();
        }
        if (this.isAtEnd()) {
            return;
        }
        var c = this.currentCharacter();
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
        throw new Error("Unexpected token '".concat(c, "'"));
    };
    ParserState.prototype.currentCharacter = function () {
        return this.s.substr(this.index, 1);
    };
    ParserState.prototype.characterAtOffset = function (offset) {
        return this.s.substr(this.index + offset, 1);
    };
    ParserState.prototype.nextSymbolToken = function (c) {
        var s = "";
        while (isAlpha(c)) {
            s += c;
            this.next();
            c = this.currentCharacter();
        }
        this._tokenType = TokenType.Symbol;
        this._token = s;
    };
    /**
     * @todo support decimals
     */
    ParserState.prototype.nextNumericToken = function (c) {
        var s = "";
        while (isNumeric(c)) {
            s += c;
            this.next();
            c = this.currentCharacter();
        }
        this._tokenType = TokenType.Number;
        this._token = s;
    };
    ParserState.prototype.nextStringToken = function () {
        this.next();
        var s = "";
        var c = this.currentCharacter();
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
    };
    ParserState.prototype.nextDelimeterToken = function (c) {
        this._tokenType = TokenType.Delimeter;
        this._token = c;
        this.next();
    };
    ParserState.prototype.canIgnoreCurrentCharacter = function () {
        var c = this.currentCharacter();
        return whitespace.has(c);
    };
    ParserState.prototype.isAtEnd = function () {
        return this.currentCharacter() === "";
    };
    ParserState.prototype.next = function () {
        this.index++;
    };
    return ParserState;
}());

function astFromString(s) {
    var state = new ParserState(s);
    var out = parseObject(state);
    if (state.tokenType() !== TokenType.None) {
        throw new Error("Expected end of template");
    }
    return out;
}

var trivialTypeOfs = new Set(["string", "number", "boolean", "undefined"]);
function typeAsString(value) {
    if (value === null)
        return "null";
    var typeOf = typeof value;
    if (trivialTypeOfs.has(typeOf))
        return typeOf;
    if (Array.isArray(value)) {
        return "array";
    }
    return "object";
}

function isNullOrUndefined(value) {
    return typeof value === "undefined" || value === null;
}

function isPlainObject(value) {
    return (value === null || value === void 0 ? void 0 : value.constructor) === Object;
}

function stringifyPropertyPath(path) {
    var out = "";
    for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
        var part = path_1[_i];
        if (out && !part.startsWith("[")) {
            out += ".";
        }
        out += part;
    }
    return out;
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(options) {
        var _this = _super.call(this) || this;
        _this.setPath = function (path) {
            _this.path = stringifyPropertyPath(path);
            _this.pathParts = path;
            return _this;
        };
        _this.name = "ValidationError";
        _this.message = options.message;
        _this.value = options.value;
        _this.setPath(options.ctx.path);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, ValidationError);
        }
        return _this;
    }
    ValidationError.empty = function () {
        return new ValidationError({ message: "", value: null, ctx: { path: [] } });
    };
    return ValidationError;
}(Error));

function validateArray(arr, spec, ctx) {
    if (isNullOrUndefined(arr)) {
        if (!spec.optional) {
            return new ValidationError({
                message: "Field '".concat(stringifyPropertyPath(ctx.path), "' is required"),
                value: arr,
                ctx: ctx,
            });
        }
        return null;
    }
    var isNotArray = !Array.isArray(arr);
    if (isNotArray) {
        return new ValidationError({
            message: "Expected array, got ".concat(typeAsString(arr)),
            value: arr,
            ctx: ctx,
        });
    }
    for (var i = 0; i < arr.length; i++) {
        ctx.path.push("[".concat(i, "]"));
        var value = arr[i];
        var err = validateValue(value, spec.value, ctx);
        if (err)
            return err;
        ctx.path.pop();
    }
    return null;
}

function validateBoolean(value, ctx) {
    if (isNullOrUndefined(value)) {
        return null;
    }
    var isNotBooleanValue = typeof value !== "boolean";
    if (isNotBooleanValue) {
        return new ValidationError({
            message: "Expected boolean value, got ".concat(typeAsString(value)),
            value: value,
            ctx: ctx,
        });
    }
    return null;
}

function validateInt(ctx, value) {
    if (Number.isInteger(value)) {
        return null;
    }
    return new ValidationError({
        message: "Number is not an integer",
        ctx: ctx,
        value: value,
    });
}
function validatePositive(ctx, value) {
    if (value >= 0) {
        return null;
    }
    return new ValidationError({ message: "Number is not positive", ctx: ctx, value: value });
}
function validateMin$1(ctx, value, rule) {
    if (value >= rule.value) {
        return null;
    }
    return new ValidationError({
        message: "Number is lower than '".concat(rule.value, "'"),
        ctx: ctx,
        value: value,
    });
}
function validateMax$1(ctx, value, rule) {
    if (value <= rule.value) {
        return null;
    }
    return new ValidationError({
        message: "Number is higher than '".concat(rule.value, "'"),
        ctx: ctx,
        value: value,
    });
}
function validateNumberRule(ctx, value, rule) {
    var type = rule.type;
    switch (type) {
        case "int":
            return validateInt(ctx, value);
        case "positive":
            return validatePositive(ctx, value);
        case "min":
            return validateMin$1(ctx, value, rule);
        case "max":
            return validateMax$1(ctx, value, rule);
        default:
            enforceExhaustive(type);
    }
}

function validateNumber(value, rules, ctx) {
    if (isNullOrUndefined(value)) {
        return null;
    }
    var isNotNumberValue = typeof value !== "number";
    if (isNotNumberValue) {
        return new ValidationError({
            message: "Expected number value, got ".concat(typeAsString(value)),
            value: value,
            ctx: ctx,
        });
    }
    if (!Number.isFinite(value)) {
        return new ValidationError({
            message: "Expected finite number value, got ".concat(value),
            value: value,
            ctx: ctx,
        });
    }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        var err = validateNumberRule(ctx, value, rule);
        if (err) {
            return err;
        }
    }
    return null;
}

var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

function validateEmail(ctx, value) {
    if (emailRegex.test(value)) {
        return null;
    }
    return new ValidationError({ message: "Invalid email address", ctx: ctx, value: value });
}
function validateMin(ctx, value, min) {
    if (value.length < min) {
        return new ValidationError({
            message: "String length must be lower than ".concat(min),
            ctx: ctx,
            value: value,
        });
    }
    return null;
}
function validateMax(ctx, value, max) {
    if (value.length > max) {
        return new ValidationError({
            message: "String length must not exceed ".concat(max),
            ctx: ctx,
            value: value,
        });
    }
    return null;
}
function validateLength(ctx, value, len) {
    if (value.length !== len) {
        return new ValidationError({
            message: "String length must equal ".concat(len),
            ctx: ctx,
            value: value,
        });
    }
    return null;
}
function validateUuid(ctx, value) {
    if (!uuidRegex.test(value)) {
        return new ValidationError({
            message: "String is not a valid uuid",
            ctx: ctx,
            value: value,
        });
    }
    return null;
}
function validateStringRule(ctx, value, rule) {
    var type = rule.type;
    switch (type) {
        case "email":
            return validateEmail(ctx, value);
        case "min":
            return validateMin(ctx, value, rule.value);
        case "max":
            return validateMax(ctx, value, rule.value);
        case "length":
            return validateLength(ctx, value, rule.value);
        case "uuid":
            return validateUuid(ctx, value);
        default:
            enforceExhaustive(type);
    }
}

function validateString(value, rules, ctx) {
    if (isNullOrUndefined(value)) {
        return null;
    }
    var isNotStringValue = typeof value !== "string";
    if (isNotStringValue) {
        return new ValidationError({
            message: "Expected string value, got ".concat(typeAsString(value)),
            value: value,
            ctx: ctx,
        });
    }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        var err = validateStringRule(ctx, value, rule);
        if (err) {
            return err;
        }
    }
    return null;
}

function validatePrimitive(value, spec, ctx) {
    value !== null && value !== void 0 ? value : (value = spec.defaultValue);
    if (!spec.optional && isNullOrUndefined(value)) {
        return new ValidationError({
            message: "Field '".concat(stringifyPropertyPath(ctx.path), "' is required"),
            ctx: ctx,
            value: value,
        });
    }
    var valueType = spec.valueType;
    switch (valueType) {
        case "string": {
            var rules = spec.rules;
            return validateString(value, rules, ctx);
        }
        case "number": {
            var rules = spec.rules;
            return validateNumber(value, rules, ctx);
        }
        case "boolean": {
            return validateBoolean(value, ctx);
        }
        default:
            enforceExhaustive(valueType, "Unexpected value type");
    }
}

function validateRecord(record, spec, ctx) {
    if (isNullOrUndefined(record)) {
        return null;
    }
    var isNotObjectValue = !isPlainObject(record);
    if (isNotObjectValue) {
        return new ValidationError({
            message: "Expected object value, got ".concat(typeAsString(record)),
            value: record,
            ctx: ctx,
        });
    }
    var entries = Object.entries(record);
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var _a = entries_1[_i], key = _a[0], value = _a[1];
        ctx.path.push(key);
        if (spec.key.valueType === "number") {
            var keyAsNumber = Number(key);
            if (!Number.isFinite(keyAsNumber)) {
                return new ValidationError({
                    message: "Expected numeric key, got '".concat(key, "'"),
                    value: key,
                    ctx: ctx,
                });
            }
        }
        var valueErr = validateValue(value, spec.value, ctx);
        if (valueErr)
            return valueErr;
        ctx.path.pop();
    }
    return null;
}

function validateValue(value, valueSpec, ctx) {
    var type = valueSpec.type;
    switch (type) {
        case "object": {
            var err = validateObject(value, valueSpec, ctx);
            if (err)
                return err;
            break;
        }
        case "array": {
            var err = validateArray(value, valueSpec, ctx);
            if (err)
                return err;
            break;
        }
        case "primitive": {
            var err = validatePrimitive(value, valueSpec, ctx);
            if (err)
                return err;
            break;
        }
        case "record": {
            var err = validateRecord(value, valueSpec, ctx);
            if (err)
                return err;
            break;
        }
        default:
            enforceExhaustive(type, "Unexpected value type");
    }
}

function validateObject(obj, spec, ctx) {
    if (isNullOrUndefined(obj)) {
        if (!spec.optional && spec.hasRequiredProperties) {
            return new ValidationError({
                message: "Field '".concat(stringifyPropertyPath(ctx.path), "' is required"),
                value: obj,
                ctx: ctx,
            });
        }
        return null;
    }
    var isNotObjectValue = !isPlainObject(obj);
    if (isNotObjectValue) {
        return new ValidationError({
            message: "Expected object value, got ".concat(typeAsString(obj)),
            value: obj,
            ctx: ctx,
        });
    }
    for (var _i = 0, _a = spec.properties; _i < _a.length; _i++) {
        var property = _a[_i];
        ctx.path.push(property.key);
        var value = obj[property.key];
        var err = validateValue(value, property.value, ctx);
        if (err)
            return err;
        ctx.path.pop();
    }
    return null;
}

function copyProperty(value, ast) {
    var type = ast.type;
    switch (type) {
        case "primitive":
            if (isNullOrUndefined(value))
                return ast.defaultValue;
            return value;
        case "object":
            return copyObject(value, ast);
        case "array":
            return copyArray(value, ast);
        case "record":
            return copyRecord(value || {}, ast);
        default:
            enforceExhaustive(type, "Unexpected type");
    }
}
function copyArray(array, ast) {
    if (!array)
        return null;
    return array.map(function (value) { return copyProperty(value, ast.value); });
}
/**
 * Assumes that the object has already been validated to match the AST.
 */
function copyObject(object, ast) {
    if (isNullOrUndefined(object)) {
        if (ast.optional)
            return null;
        if (!ast.hasRequiredProperties) {
            object = {};
        }
        else {
            throw new Error("Expected object, got '".concat(typeAsString(object), "'"));
        }
    }
    var from = object;
    var to = {};
    for (var _i = 0, _a = ast.properties; _i < _a.length; _i++) {
        var property = _a[_i];
        to[property.key] = copyProperty(from[property.key], property.value);
    }
    return to;
}
function copyRecord(record, ast) {
    var out = {};
    for (var _i = 0, _a = Object.entries(record || {}); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (isNullOrUndefined(value))
            continue;
        out[key] = copyProperty(value, ast.value);
    }
    return out;
}

function compileSchema(template) {
    var ast = astFromString(template);
    var schema = {
        parseSync: function (value) {
            if (!isPlainObject(value)) {
                throw new Error("Expected object, got '".concat(typeAsString(value), "'"));
            }
            var err = validateObject(value, ast, { path: [] });
            if (err) {
                throw err;
            }
            return copyObject(value, ast);
        },
        __valueType: null,
    };
    return schema;
}

exports.compileSchema = compileSchema;
