export const normalizeTag = (tag: string) => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
};

export const normalizeTags = (tags: string[]) => {
  const normalized = tags.map(normalizeTag).filter(Boolean);

  return Array.from(new Set(normalized));
};

export const formatTagLabel = (tag: string) => `#${tag}`;
