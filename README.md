
# business-rules-processor

Use natural language to create rules for processing business logic

## Validate a data set

Assuming the data set is:

```json
{
    "testKey": "bar",
    "fooKey": null
}
```

### Using a plain english string

```js
const { validate } = require("business-rules-processor");

const valid = validate('{testKey} is any ("foo", "bar")', data);

console.log(valid) // true
```

### Using a precompiled rule set

```js
const { parseRule, validate } = require("business-rules-processor");

const rules = parseRule('{fooKey} is not empty')
const valid = validate(rules, data);

console.log(valid) // false
```

## Rule Structure

The structure of a rule is always:

`<Key> <operator> [value]`

Rules may be combined using `and`/`or`, and may be
grouped using parentheses:

`(<Key> <operator> <value> and <Key> <operator> <value>) or ...`

Certain operators do not require `[value]`.

## Grammar

* `Key`: a string surrounded by single curly brances: `{foo}`
  * Key may use dot notation
  * The value will be extracted from the data set

* `Value`: May be `boolean`, `string`, `number`, `null` or another `Key`

### Operators

* `eq`: "equal to"

  `neq`: "not equal to"
  
  * Only accepts a single `Value`

    `{foo} eq 1`

    `{foo} neq "bar"`

* `gte`: "Greater than or equal to"
  
  `gt`: "Greater than"
  
  `lte`: "Less than or equal to"
  
  `lt`: "Less than"
  * Only accepts a single `Value`

    `{foo} gt 1`

    `{foo} lte {bar}`

    etc...

* `between`, `not between`

  Validates that the `Key` falls between two `Value`, inclusively.
  * Accepts a tuple `Value`: `(<Value>, <Value>)`

    _Does check strings_:
    `{foo} between ("bar", "baz")`

    _more commonly used with numbers_:
    `{foo} between (1, 100)`

* `any`, `not any`

  Checks the `Key` value against all `Value` in a list
  * Accepts a list of `Value`: `(<Value>, <Value>, <Value>, ...)`.
  * Case insensitive.

    `{foo} not any ("bar", "baz", "zap")`

* `matches`, `imatches`, `not matches`, `not imatches`

  Checks to see if `Key` matches a substring of `Value`
  * Accepts a single `Value`
  * `imatches` is case insensitive

    `{foo} matches "foobar"`

* `is empty`, `is not empty`

  Verifies that the provided `Key` is present in the data set (or not)
  * Accepts no `Value`
  * `null` values are considered empty

  `{foo} is empty`

## To test

* Use `run.js` to validate a data set against a rule

### Test examples

* Using the default testing data set

  ```sh
  > node ./run.js '{asdf} is not empty'
  Dataset satisfies the rule: false

  > node ./run.js '{asdf} is empty'    
  Dataset satisfies the rule: true
  ```

* Provide your own dataset

  _Some data set I've stored in the local directory_

  ```json
  {
      "testKey": "Some value for testing"
  }
  ```

  ```sh
  # Resolves data file relative to `process.cwd()`
  > node ./run.js -d "./test-data.json" '{testKey} imatches "some value"'
  Dataset satisfies the rule: true

  > node ./run.js -d "./test-data.json" '{testKey} not imatches "some value"'
  Dataset satisfies the rule: false
  ```
