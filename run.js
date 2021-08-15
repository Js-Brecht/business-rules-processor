const path = require("path");
const yargs = require("yargs");
const { validate, parseRule } = require("./dist");

yargs.command(
    "$0 <rule>",
    "Parse rule, and validate given data set",
    (argv) => (
        argv
            .positional("rule", {
                desc: "The rule to parse and compare to the dataset",
                demandOption: true,
            })
            .option("data", {
                alias: "d",
                desc: "Specify the location of a json data set to compare the rule against",
                demandOption: false,
            })
    ),
    async (argv) => {
        const dataSetLoc = path.resolve(
            process.cwd(),
            argv.data || "./data.json",
        );

        const dataSet = require(dataSetLoc);
        const rules = parseRule(argv.rule);
        const valid = validate(rules, dataSet);

        console.log("Dataset satisfies the rule:", valid);
    },
).argv;