import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function SecurePDFViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("pdfUrl");
    const time = parseInt(params.get("time") || "0", 10);

    if (url && time > 0) {
      setPdfUrl(decodeURIComponent(url));
      setTimeRemaining(time);
    } else {
      setError("Invalid PDF URL or time parameter");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!pdfUrl) return <div>No PDF to display</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto" style={{ userSelect: "none" }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Secure PDF Viewer</h2>
        <div>Time Remaining: {Math.floor(timeRemaining / 60)}:{timeRemaining % 60} min</div>
      </div>
      <div style={{ height: "80vh", overflow: "auto" }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(error) => setError(`Failed to load PDF: ${error.message}`)}
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={index + 1}
              pageNumber={index + 1}
              width={window.innerWidth * 0.9}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onContextMenu={(e) => e.preventDefault()}
              onSelect={(e) => e.preventDefault()}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}