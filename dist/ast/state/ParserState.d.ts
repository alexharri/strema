import { TokenType } from "../token";
export declare class ParserState {
    private s;
    private index;
    private _token;
    private _tokenType;
    constructor(s: string);
    token(): string;
    tokenType(): TokenType;
    atDelimeter(delimeter: string): boolean;
    nextToken(): void;
    private currentCharacter;
    private characterAtOffset;
    private nextSymbolToken;
    /**
     * @todo support decimals
     */
    private nextNumericToken;
    private nextStringToken;
    private nextDelimeterToken;
    private canIgnoreCurrentCharacter;
    private isAtEnd;
    private next;
}
