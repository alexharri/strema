import { ValidationContext } from "../types/ValidationContext";
interface Options {
    message: string;
    value: unknown;
    ctx: ValidationContext;
}
export declare class ValidationError extends Error {
    value: unknown;
    path: string;
    pathParts: string[];
    constructor(options: Options);
    static empty(): ValidationError;
    setPath: (path: string[]) => this;
}
export {};
