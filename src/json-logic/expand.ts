import { TestTypes, RuleSequence, KeyVar, Test } from "../parser";
import type { RulesLogic as BaseRulesLogic } from "json-logic-js";

type RulesLogic = (
    | BaseRulesLogic
    | { iin: Extract<BaseRulesLogic, { "in": any }> }
);

type ExtractObjects<T> = {
    [K in T extends Record<string, any>
        ? keyof T
        : never
    ]: T
};
type ExtractObjectKeys<T> = T extends Record<string, any>
    ? keyof T
    : never;

type RuleObjects = ExtractObjects<RulesLogic>;
type Operations = ExtractObjectKeys<RuleObjects>;

type ConversionObjects = {
    [K in TestTypes]: Extract<RuleSequence, { type: K }>;
}
type HasNegated = Extract<RuleSequence, { type: "not" }>["args"]["type"];
type ConversionHandlers = {
    [K in TestTypes]: K extends HasNegated
        ? (obj: ConversionObjects[K], not?: boolean) => any
        : (obj: ConversionObjects[K]) => any;
}

const isNil = (val: any) => (
    val == null
);
const getVar = (varName: string): KeyVar => ({ "var": varName });
const operator = (
    oper: Operations,
    comp: RulesLogic | RulesLogic[] | (RulesLogic | RulesLogic[])[],
) => (
    {[oper]: comp} as unknown as RulesLogic
);

const comparison = (
    oper: Operations,
    ...values: (RulesLogic | RulesLogic[])[]
) => (
    operator(oper, values)
);

const varComparison = (
    oper: Operations,
    varName: string,
    value: RulesLogic,
    varLast = false,
) => {
    const useVal = isNil(value) ? [] : [value];
    const useVarVal = getVar(varName);
    return varLast
        ? comparison(oper, useVal, useVarVal)
        : comparison(oper, useVarVal, useVal);
};

const collection = (
    type: Operations,
    values: RulesLogic,
    ...comp: (RulesLogic | RulesLogic[])[]
): {
        [op in Operations]: (RulesLogic | RulesLogic[])[]
    } => ({
    [type]: [ values, ...comp ],
} as {
    [op in Operations]: (RulesLogic | RulesLogic[])[]
});

const ifCond = (
    comp: RulesLogic,
    ifTrue: boolean,
    ifFalse: boolean,
) => (
    { "if": [ comp, ifTrue, ifFalse ]}
);

const conversions: ConversionHandlers = {
    and(obj) {
        return {
            and: obj.tests.map(expand),
        };
    },
    or(obj) {
        return {
            or: obj.tests.map(expand),
        };
    },

    lt(obj) {
        return varComparison("<", obj.key, obj.value);
    },
    lte(obj) {
        return varComparison("<=", obj.key, obj.value);
    },
    gt(obj) {
        return varComparison(">", obj.key, obj.value);
    },
    gte(obj) {
        return varComparison(">=", obj.key, obj.value);
    },
    between(obj) {
        return comparison("<=", obj.values[0], getVar(obj.key), obj.values[1]);
    },
    equal(obj, not) {
        return varComparison(
            not ? "!=" : "==",
            obj.key,
            obj.value,
        );
    },

    any(obj, not) {
        const [ifTrue, ifFalse] = not
            ? [false, true]
            : [true, false];
        return ifCond(
            collection(
                "iin",
                getVar(obj.key),
                obj.values,
            ),
            ifTrue,
            ifFalse,
        );
    },
    matches(obj, not) {
        const comp = obj.type === "matches"
            ? "in"
            : "iin";
        const [ifTrue, ifFalse] = not
            ? [false, true]
            : [true, false];
        return ifCond(
            comparison(comp, obj.value, getVar(obj.key)),
            ifTrue,
            ifFalse,
        );
    },
    imatches(obj, not) {
        return (this.matches as unknown as ConversionHandlers["imatches"])(obj, not);
    },
    empty(obj, not) {
        const [ifTrue, ifFalse] = not
            ? [false, true]
            : [true, false];
        return ifCond(
            collection(
                "in",
                obj.key,
                { "missing": [obj.key] },
            ),
            ifTrue,
            ifFalse,
        );
    },

    not(obj) {
        return (this[obj.args.type] as any)(obj.args, true);
    },
};

export const expand = (seq: RuleSequence): RulesLogic => {
    return conversions[seq.type](seq as any);
};
