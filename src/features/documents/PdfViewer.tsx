import { useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";

// Configure the PDF.js worker once at module load. It must be set in the same
// module that renders <Document> so the worker URL resolves correctly (pnpm
// hoists `pdfjs-dist` to the app root, so the bare specifier is required here).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  bytes: ArrayBuffer;
  page: number;
  onTotalChange: (total: number) => void;
  onError: (message: string) => void;
}

/**
 * Renders a single page of a PDF via react-pdf. The parent owns the current
 * page and reports the total page count back through `onTotalChange`.
 */
export function PdfViewer({ bytes, page, onTotalChange, onError }: PdfViewerProps) {
  // Copy the buffer so pdf.js can transfer/detach its own copy without
  // affecting the source buffer held by the parent.
  const file = useMemo(() => bytes.slice(0), [bytes]);

  return (
    <Document
      file={file}
      onLoadSuccess={(document) => onTotalChange(document.numPages)}
      onLoadError={(error) => onError(error.message)}
      loading={<p>Loading PDF…</p>}
      error={<p>Failed to load PDF.</p>}
      // Opt out of Suspense (default in react-pdf v11): without a <Suspense>
      // boundary the component would suspend and unmount the whole tree.
      suspense={false}
    >
      <Page
        pageNumber={page}
        renderTextLayer
        renderAnnotationLayer={false}
        suspense={false}
      />
    </Document>
  );
}
