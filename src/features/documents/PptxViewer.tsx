import { useEffect, useRef } from "react";
import {
  PptxViewer as PptxViewerImpl,
  RECOMMENDED_ZIP_LIMITS,
} from "@aiden0z/pptx-renderer";
import styles from "./DocumentViewer.module.css";

interface PptxViewerProps {
  bytes: ArrayBuffer;
  page: number;
  onTotalChange: (total: number) => void;
  onError: (message: string) => void;
}

/**
 * Renders a single PPTX slide via `@aiden0z/pptx-renderer` in slide mode.
 * The library renders into the provided container; we drive navigation with
 * `goToSlide` as the parent changes the current page.
 */
export function PptxViewer({ bytes, page, onTotalChange, onError }: PptxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PptxViewerImpl | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    PptxViewerImpl.open(bytes, container, {
      renderMode: "slide",
      // Disable the EMF-PDF fallback; we render shapes natively.
      pdfjs: false,
      zipLimits: RECOMMENDED_ZIP_LIMITS,
    })
      .then((viewer) => {
        if (cancelled) {
          viewer.destroy();
          return;
        }
        viewerRef.current = viewer;
        onTotalChange(viewer.slideCount);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          onError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [bytes, onTotalChange, onError]);

  useEffect(() => {
    void viewerRef.current?.goToSlide(page - 1);
  }, [page]);

  return <div ref={containerRef} className={styles.slideStage} />;
}
