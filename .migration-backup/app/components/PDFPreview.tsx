"use client";

import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function PDFPreview({
  file,
}: {
  file: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl flex justify-center">
      <Document
        file={file}
        loading={<div className="p-4">Loading PDF...</div>}
        error={<div className="p-4">Failed to load PDF.</div>}
      >
        <Page
          pageNumber={1}
          width={280}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}