import { parseReportNarrative } from "../supabase/functions/_shared/parseReportNarrative";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const longOverview = `${"A complete reflection keeps every detail visible. ".repeat(24)}to`;
const patterns = Array.from(
  { length: 10 },
  (_, index) => `Complete pattern ${index + 1}.`,
);
const validNarrative = {
  activities: ["Walking", "Reading"],
  challenges: ["A busy schedule"],
  dataQualityNote: "",
  emotionalFlow: ["Uncertain", "Calm"],
  emotionalJourney: "The period moved from uncertainty toward calm.",
  enjoyed: ["A quiet morning"],
  improvements: ["Protect more rest"],
  nextFocus: "Keep one small promise each day.",
  overview: longOverview,
  patterns,
  reflectionPrompt: "",
  wins: ["Made time to reflect"],
};

const parsed = parseReportNarrative(JSON.stringify(validNarrative), false);

assert(parsed.ok, "A complete long report should parse successfully.");

if (parsed.ok) {
  assert(
    parsed.narrative.overview === longOverview,
    "Long narrative fields must not be truncated or rewritten.",
  );
  assert(
    parsed.narrative.patterns.length === patterns.length,
    "Narrative arrays must not be sliced.",
  );
  assert(
    parsed.narrative.reflectionPrompt === null &&
      parsed.narrative.dataQualityNote === null,
    "Empty optional fields should normalize to null.",
  );
}

const fenced = parseReportNarrative(
  `\`\`\`json\n${JSON.stringify(validNarrative)}\n\`\`\``,
  false,
);
assert(fenced.ok, "A fenced JSON response should parse.");

const wrapped = parseReportNarrative(
  `Here is the report:\n${JSON.stringify(validNarrative)}\nDone.`,
  false,
);
assert(wrapped.ok, "A valid JSON object should be recovered from wrapper text.");

const capped = parseReportNarrative(JSON.stringify(validNarrative), true);
assert(
  capped.ok && capped.narrative.dataQualityNote?.includes("first 250 entries") === true,
  "Capped reports should receive the truthful server data-quality note.",
);

const invalid = parseReportNarrative(
  JSON.stringify({ ...validNarrative, patterns: "not-an-array" }),
  false,
);
assert(!invalid.ok, "Invalid field types should fail parsing.");

if ("reason" in invalid) {
  assert(
    invalid.reason === "invalid_patterns",
    "Invalid field types should return a safe diagnostic reason.",
  );
}
