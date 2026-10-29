import type { Rule } from "../types";
import { phpRules } from "./php";
import { jsRules } from "./js";
import { secretRules } from "./secrets";
import { agentRules, ciRules } from "./agent";
import { malwareRules } from "./malware";
import { hardeningRules } from "./hardening";

/**
 * All active rules. To add a rule, append a LineRule (regex per line) or a
 * FileRule (custom check over the whole file) to one of the rule sets, or add
 * a new set here for another language.
 */
export const ALL_RULES: Rule[] = [...phpRules, ...jsRules, ...secretRules, ...agentRules, ...ciRules, ...malwareRules, ...hardeningRules];

export { phpRules, jsRules, secretRules, agentRules, ciRules, malwareRules, hardeningRules };
