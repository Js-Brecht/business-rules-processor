
type Key = string;
export type KeyVar = { "var": Key };
type Value = string | boolean | number | KeyVar;

type Not<V> = {
    type: "not";
    args: V;
}

type EqualTest = {
    type: "equal";
    key: Key;
    value: Value;
}
type NotEqualTest = Not<EqualTest>;
type GtTest = {
    type: "gt"
    key: Key;
    value: Value;
}
type GteTest = {
    type: "gte"
    key: Key;
    value: Value;
}
type LtTest = {
    type: "lt"
    key: Key;
    value: Value;
}
type LteTest = {
    type: "lte"
    key: Key;
    value: Value;
}
type BetweenTest = {
    type: "between";
    key: Key;
    values: [Value, Value];
}
type NotBetweenTest = Not<BetweenTest>;
type AnyTest = {
    type: "any";
    key: Key;
    values: Value[];
}
type NotAnyTest = Not<AnyTest>;
type MatchesTest = {
    type: "matches";
    key: Key;
    value: Value;
}
type NotMatchesTest = Not<MatchesTest>;
type IMatchesTest = {
    type: "imatches";
    key: Key;
    value: Value;
}
type NotIMatchesTest = Not<IMatchesTest>;

type EmptyTest = {
    type: "empty";
    key: Key;
}
type NotEmptyTest = Not<EmptyTest>;

type Or = {
    type: "or";
    tests: RuleSequence[];
}
type And = {
    type: "and";
    tests: RuleSequence[];
}

export type Test = (
    | EqualTest
    | NotEqualTest
    | GtTest
    | GteTest
    | LtTest
    | LteTest
    | BetweenTest
    | NotBetweenTest
    | AnyTest
    | NotAnyTest
    | MatchesTest
    | NotMatchesTest
    | IMatchesTest
    | NotIMatchesTest
    | EmptyTest
    | NotEmptyTest
);

export type TestTypes = RuleSequence["type"];

export type RuleSequence = Test | And | Or;