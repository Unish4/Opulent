export const diffFields = <T extends Record<string, unknown>>(
  before: T,
  after: T,
  keys: (keyof T)[],
): Record<string, { before: unknown; after: unknown }> => {
  const changed: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed[String(key)] = { before: before[key], after: after[key] };
    }
  }
  return changed;
};
