import { pdfjs } from 'react-pdf';

// Configure PDF.js worker - this must be done before any PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export {};