import jsonLogic, { RulesLogic } from "json-logic-js";
import { JsonObject } from "type-fest";
import { RuleSequence } from "../parser";
import { expand } from "./expand";

jsonLogic.add_operation("iin", function(input, compare) {
    if (!Array.isArray(compare)) {
        return compare.toString().toLowerCase().indexOf(
            input.toString().toLowerCase(),
        ) > -1;
    }

    return (compare || []).some((v) => (
        v.toString().toLowerCase() === input
    ));
});

export const validate = (
    sequence: RuleSequence,
    data: JsonObject,
) => {
    const rules = expand(sequence);
    const result = jsonLogic.apply(rules as RulesLogic, data);
    return result;
};