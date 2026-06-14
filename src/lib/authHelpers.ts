/**
 * Deterministically generates a UUID from a given string (e.g. Firebase UID).
 * This uses a simple FNV-1a synchronous hashing method, ensuring that 
 * the exact same input string always maps to the exact same valid UUID.
 */
export function getDeterministicUuid(str: string): string {
  let hval = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  // Ensure positive 32-bit integer and pad hex
  const hash = (hval >>> 0).toString(16).padStart(8, '0');
  
  // Build a dummy UUID using the hashed hex repeated
  const base = hash + hash + hash + hash;
  
  return [
    base.substring(0, 8),
    base.substring(8, 12),
    '4' + base.substring(13, 16), // version 4 style
    'a' + base.substring(17, 20), // variant 1 style
    base.substring(20, 32)
  ].join('-');
}
