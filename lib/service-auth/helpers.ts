export function normalizeIdentifier(identifier: string) {
  const v = identifier.trim();
  return v.includes('@') ? v.toLowerCase() : v;
}
