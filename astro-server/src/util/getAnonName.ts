export function getAnonName(guid: string): string {
  const cleanGuid = guid.replace(/-/g, "").toUpperCase();

  let hash = 0;
  for (let i = 0; i < cleanGuid.length; i++) {
    const char = cleanGuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const fourDigitNumber = Math.abs(hash) % 10000;

  return "Unknown #" + fourDigitNumber.toString().padStart(4, "0");
}
