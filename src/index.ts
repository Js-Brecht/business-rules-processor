import { parser, RuleSequence } from "./parser";
import { validate as validateData } from "./json-logic";
import { JsonObject } from "type-fest";

/**
 * @param input - Must be a plain english rule to generate
 * a rule set for.
 *
 * * Must match the grammar defined for the parser
 */
export const parseRule = (input: string) => (
    parser.parse(input)
);

const isRuleSequence = (input: string | RuleSequence): input is RuleSequence => (
    typeof input === "object"
);

/**
 * @param input - May be a pre-parsed rule set or a string to parse
 * into a rule set
 * @param data - The JSON object you want to validate against the rule
 */
export const validate = (input: string | RuleSequence, data: JsonObject): boolean => {
    const useRules = isRuleSequence(input) ? input : parseRule(input);
    return validateData(useRules, data);
};