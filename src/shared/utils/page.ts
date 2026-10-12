/**
 * Page index helpers. Internal indexes are zero-based; user-facing page
 * numbers are one-based. See AGENTS.md §5.2.
 */

export function toDisplayPageNumber(pageIndex: number): number {
  return pageIndex + 1;
}

export function toPageIndex(displayPageNumber: number): number {
  return displayPageNumber - 1;
}
