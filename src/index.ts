import { parser } from "./parser";
import { validate } from "./json-logic";

const data = {
    "test": {
        "asdf": "none",
    },
    "name": "none",
    "1": 11,
    "asdf": undefined,
};

const input = '{test.asdf} imatches "Non"';

const rules = parser.parse(input);
const results = validate(rules, data);

console.log(results);