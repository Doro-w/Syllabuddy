/**
 * Core document and page contracts shared across feature modules.
 * See AGENTS.md §5.2 (reader context) and §7 (domain model).
 */

export type DocumentType = "pdf" | "pptx";

export interface PageReference {
  documentId: string;
  documentType: DocumentType;
  /** Zero-based internal index. */
  pageIndex: number;
  /** One-based number shown to the user. */
  displayPageNumber: number;
  sourcePageLabel?: string;
}

export type ParsingStatus = "pending" | "processing" | "ready" | "failed";

export interface DocumentRecord {
  id: string;
  title: string;
  documentType: DocumentType;
  originalFileName: string;
  /** Internal local path; must not be exposed to UI or remote providers. */
  storagePath: string;
  contentHash: string;
  pageCount: number;
  importedAt: string;
  updatedAt: string;
  parsingStatus: ParsingStatus;
}

export type ExtractionStatus = "pending" | "ready" | "failed";

export interface DocumentPage {
  documentId: string;
  pageIndex: number;
  displayPageNumber: number;
  textContent: string;
  contentHash: string;
  extractionStatus: ExtractionStatus;
}
