const fs = require("fs-extra");
const yargs = require("yargs");
const path = require("path");
const peggy = require("peggy");
const tspegjs = require("ts-pegjs");

const dataPath = path.join.bind(path, __dirname, "data");

yargs.command(
    "$0 <outFile>",
    "Generate the parser based on the current grammar",
    (yargs) => (
        yargs.positional("outFile", {
            desc: "The file to output the parser to",
            demandOption: true,
        })
    ),
    async (argv) => {
        const curExt = path.extname(argv.outFile);

        const outFile = path.resolve(
            process.cwd(),
            path.dirname(argv.outFile),
            path.basename(argv.outFile, curExt) + ".ts",
        );
        const grammar = await fs.readFile(dataPath("grammar.pegjs"), "utf8");

        const source = peggy.generate(grammar, {
            output: "source",
            plugins: [tspegjs],
            format: "es",
            tspegjs: {
                customHeader: [
                    "// @ts-nocheck",
                    "import { ParserOptions as IParseOptions } from \"peggy\";",
                ].join("\n"),
            },
        });

        await fs.writeFile(outFile, source, { "encoding": "utf-8", flags: "w" });
    },
).argv;