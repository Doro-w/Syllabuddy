/**
 * Returns the final path segment (the file or directory name).
 * Accepts both Windows (`\`) and POSIX (`/`) separators.
 */
export function basename(path: string): string {
  const segments = path.split(/[\\/]/);
  return segments[segments.length - 1] ?? path;
}
