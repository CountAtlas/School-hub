import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";

// Worker served from public/ as a static asset (copied from pdfjs-dist v3.11.174)
pdfjs.GlobalWorkerOptions.workerSrc =
  import.meta.env.BASE_URL + "pdf.worker.min.js";

interface PdfThumbnailProps {
  url: string;
  className?: string;
}

export default function PdfThumbnail({ url, className = "" }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;

    async function render() {
      setState("loading");
      setErrorMsg("");
      try {
        // Pass URL directly — pdfjs-dist v3 handles HTTP range requests natively
        loadingTask = pdfjs.getDocument({ url, withCredentials: true });
        const pdf = await loadingTask.promise;
        if (cancelled) { loadingTask.destroy(); return; }

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) { setState("error"); return; }

        const containerWidth = canvas.parentElement?.clientWidth || 280;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.max(0.3, Math.min(2, containerWidth / baseViewport.width));
        const viewport = page.getViewport({ scale });

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const ctx = canvas.getContext("2d");
        if (!ctx) { setState("error"); return; }

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setState("done");
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(String(err?.message ?? err?.name ?? "failed"));
          setState("error");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [url]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-zinc-900 ${className}`}>
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-zinc-500">
          <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px]">PDF preview</span>
          {errorMsg && (
            <span className="px-2 text-center text-[9px] text-red-400 break-all max-w-full">{errorMsg}</span>
          )}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ display: state === "done" ? "block" : "none" }}
      />
    </div>
  );
}
