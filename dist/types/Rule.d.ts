export declare type StringEmailRule = {
    type: "email";
};
export declare type StringMinRule = {
    type: "min";
    value: number;
};
export declare type StringMaxRule = {
    type: "max";
    value: number;
};
export declare type StringLengthRule = {
    type: "length";
    value: number;
};
export declare type StringUuidRule = {
    type: "uuid";
};
export declare type StringRule = StringEmailRule | StringMinRule | StringMaxRule | StringLengthRule | StringUuidRule;
export declare type NumberIntRule = {
    type: "int";
};
export declare type NumberPositiveRule = {
    type: "positive";
};
export declare type NumberMaxRule = {
    type: "max";
    value: number;
};
export declare type NumberMinRule = {
    type: "min";
    value: number;
};
export declare type NumberRule = NumberIntRule | NumberPositiveRule | NumberMinRule | NumberMaxRule;
export declare type Rule = StringRule | NumberRule;
export declare type RuleType = Rule["type"];
