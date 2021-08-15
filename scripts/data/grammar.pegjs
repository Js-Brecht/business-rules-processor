{
  const getAny = (head, tail) => {
    const values = [head]
    tail.forEach(function(group) {
        values.push(group[3])
    })
    return values;
  }
  
  const getNot = (args) => ({
    type: "not",
    args
  })
  
  const getArgs = (args, not) => {
    if (not) return {
      type: "not",
      args
    }
    return args;
  }
  
  const comp = (from, to) => (
    from.toLowerCase() === to.toLowerCase()
  );
}

Start
  = Sequence

Sequence
  = items:(operation:Operation _+ type:("and"i/"or"i) _+)+ last:Operation {
    items.reverse();

    return items.reduce((condition, right) => {
      const [operation,,type] = right
      return {
        type: type.toLowerCase(),
        tests: [operation, condition]
      };
    }, last);
  }
  / Test

Operation
  = "(" _* sequence:Sequence _* ")" { return sequence; }
  / Test

Test "test"
  = Equal
  / Range
  / Between
  / Any
  / Matches
  / Empty

Equal "equal"
  = key:Key _+ op:("neq"i/"eq"i) _+ value:Value {
	return getArgs({
      type: 'equal',
      key: key,
      value: value
    }, comp(op, "neq"));
  }
  
Range
  = key:Key _+ op:("gte"i/"gt"i/"lte"i/"lt"i) _+ value:Value {
    return {
      type: op.toLowerCase(),
      key: key,
      value: value
    }
  }
  
Between "between"
  = key:Key _+ not:("not"i _*)? "between" _+ "(" _* values:(Value _* "," _* tail:Value) _* ")" {
    return getArgs({
      type: "between",
      key: key,
      values: [values[0], values[4]]
    }, !!not);
  }

Any "any"
  = key:Key _+ not:("not"i _*)? ("any"i/"in"i) _* "(" _* head:Value tail: (_* "," _* Value)* ")" {
    return getArgs({
      type: 'any',
      key: key,
      values: getAny(head, tail)
    }, !!not);
  }

Matches "matches"
  = key:Key _+ not:("not"i _*)? type:(("i"i)? "matches"i) _+ value:Value {
    return getArgs({
      type: type.join(""),
      key: key,
      value: value
    }, !!not)
  }

Empty "empty"
  = key:Key _+ "is"i _+ not:("not"i _*)? "empty"i {
    return getArgs({
      type: 'empty',
      key: key
    }, !!not);
  }

Key "key" =
//  head:Braced tail:("." Braced)+ {
//    const result = tail.map(token => token[1])
//    result.unshift(head)
//    return result
//  }
  key:Braced {
    return key
  }

Value "value"
  = StringLiteral
  / BooleanLiteral
  / FloatLiteral
  / IntegerLiteral
  / key:Key {
    return { var: key }
  }

BooleanLiteral "boolean"
  = "true" { return true; }
  / "false" { return false; }

StringLiteral "string"
  = Quote chars:Char* Quote {
    return chars.join('')
  }

FloatLiteral "float"
  = [0-9]+ "." [0-9]+ {
    return Number(text())
  }

IntegerLiteral "integer"
  = [0-9]+ {
    return Number(text())
  }

Braced "braced"
  = "{" chars:([^\W}]+) "}" {
    return chars.join("");
  }

Char "char"
  = Unescaped
  / Escape 
    sequence:(
      '"'
      / "\\"
      / "n"
    )
  { return sequence; }

Escape = "\\"

Quote = '"'

Unescaped = [^\W\\"\n]

_ "whitespace"
  = [\n\t ]+