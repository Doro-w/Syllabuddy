import { useCallback, useEffect, useState } from "react";
import type { DocumentType } from "../../shared/types/document";
import { readFileBytes } from "../../services/filesystem/readFile";
import { detectDocumentType } from "../../shared/utils/document";
import { PdfViewer } from "./PdfViewer";
import { PptxViewer } from "./PptxViewer";
import styles from "./DocumentViewer.module.css";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; documentType: DocumentType; bytes: ArrayBuffer };

interface DocumentViewerProps {
  path: string;
}

/**
 * Loads a document from disk, dispatches to the PDF or PPTX viewer, and owns
 * the shared page/slide navigation footer. Remount via `key` on `path` to
 * reset state cleanly between documents.
 */
export function DocumentViewer({ path }: DocumentViewerProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const documentType = detectDocumentType(path);
        if (!documentType) {
          throw new Error(`Unsupported document type for "${path}"`);
        }
        const bytes = await readFileBytes(path);
        if (!cancelled) {
          setLoadState({ status: "ready", documentType, bytes });
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [path]);

  const handleTotalChange = useCallback((nextTotal: number) => {
    setTotal(nextTotal);
  }, []);

  const handleError = useCallback((message: string) => {
    setLoadState({ status: "error", message });
  }, []);

  const pageLabel =
    loadState.status === "ready" && loadState.documentType === "pptx"
      ? "Slide"
      : "Page";

  return (
    <div className={styles.viewer}>
      <div className={styles.stage}>
        {loadState.status === "loading" && <p className={styles.status}>Loading…</p>}
        {loadState.status === "error" && (
          <p className={styles.error} role="alert">
            {loadState.message}
          </p>
        )}
        {loadState.status === "ready" &&
          (loadState.documentType === "pdf" ? (
            <PdfViewer
              bytes={loadState.bytes}
              page={page}
              onTotalChange={handleTotalChange}
              onError={handleError}
            />
          ) : (
            <PptxViewer
              bytes={loadState.bytes}
              page={page}
              onTotalChange={handleTotalChange}
              onError={handleError}
            />
          ))}
      </div>

      {total > 0 && (
        <footer className={styles.navbar}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className={styles.pageLabel}>
            {pageLabel} {page} / {total}
          </span>
          <button
            type="button"
            disabled={page >= total}
            onClick={() => setPage((current) => Math.min(total, current + 1))}
          >
            Next
          </button>
        </footer>
      )}
    </div>
  );
}
