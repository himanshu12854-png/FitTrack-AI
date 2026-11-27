import { PDFParse } from 'pdf-parse';

export const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_EXTRACTED_CHARACTERS = 15_000;

export class PdfImportError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'PdfImportError';
    this.status = status;
  }
}

const ALLOWED_PDF_MIME_TYPES = new Set([
  '',
  'application/pdf',
  'application/x-pdf',
  'application/octet-stream',
]);

export function validatePdfUpload(params: {
  fileName: string;
  fileType: string;
  size: number;
  bytes: Uint8Array;
}) {
  const lowerName = params.fileName.toLowerCase();
  const normalizedType = (params.fileType || '').toLowerCase().trim();

  if (!lowerName.endsWith('.pdf') || !ALLOWED_PDF_MIME_TYPES.has(normalizedType)) {
    throw new PdfImportError(400, 'Only PDF files are supported.');
  }

  if (params.size === 0 || params.bytes.length === 0) {
    throw new PdfImportError(400, 'The uploaded PDF file is empty.');
  }

  if (params.size > MAX_PDF_SIZE_BYTES || params.bytes.length > MAX_PDF_SIZE_BYTES) {
    throw new PdfImportError(413, 'PDF must be smaller than 2 MB.');
  }

  const signature = new TextDecoder().decode(params.bytes.slice(0, 5));
  if (signature !== '%PDF-') {
    throw new PdfImportError(400, 'The uploaded file is not a valid PDF.');
  }
}

export async function extractTextFromPdfBytes(data: Uint8Array): Promise<string> {
  const parser = new PDFParse({ data });
  let text = '';
  try {
    const result = await parser.getText();
    const raw = (result?.text || '').replace(/--\s*\d+\s+of\s+\d+\s*--/g, '').trim();
    text = raw;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid PDF';
    throw new PdfImportError(400, `Unable to read PDF structure: ${msg}`);
  } finally {
    await parser.destroy().catch(() => {});
  }

  if (!text) {
    throw new PdfImportError(
      422,
      'No readable text was found. Please upload a text-based PDF, not a scanned image.'
    );
  }

  return text.slice(0, MAX_EXTRACTED_CHARACTERS);
}
