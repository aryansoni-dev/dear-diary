const zeroWidthSpace = "\u200B";
const longTokenThreshold = 32;
const fallbackChunkLength = 24;
const preferredBreakCharacters = new Set([
  "/",
  "?",
  "&",
  "=",
  "#",
  ".",
  "-",
  "_",
  ":",
]);

export function addSafeBreakOpportunities(value: string) {
  return value.replace(/\S{32,}/gu, (token) => addBreaksToToken(token));
}

function addBreaksToToken(token: string) {
  const characters = Array.from(token);
  let charactersSinceBreak = 0;

  return characters
    .map((character) => {
      charactersSinceBreak += 1;

      if (preferredBreakCharacters.has(character)) {
        charactersSinceBreak = 0;
        return `${character}${zeroWidthSpace}`;
      }

      if (charactersSinceBreak >= fallbackChunkLength) {
        charactersSinceBreak = 0;
        return `${character}${zeroWidthSpace}`;
      }

      return character;
    })
    .join("");
}

export function needsSafeBreakOpportunities(value: string) {
  return new RegExp(`\\S{${longTokenThreshold},}`, "u").test(value);
}

