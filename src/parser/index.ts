import * as parseEngine from "./parser";
import { RuleSequence, TestTypes, Test, KeyVar } from "../types";

export type { RuleSequence, TestTypes, Test, KeyVar };

type Parser = typeof parseEngine;
interface IParser extends Parser {
    parse: (...args: Parameters<Parser["parse"]>) => RuleSequence;
}

export const parser = parseEngine as IParser;
