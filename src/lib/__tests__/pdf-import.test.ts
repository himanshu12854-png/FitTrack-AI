import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTextFromPdfBytes,
  MAX_PDF_SIZE_BYTES,
  PdfImportError,
  validatePdfUpload,
} from '../pdf-import.ts';

/**
 * Builds a minimal valid single-page PDF 1.4 buffer containing optional text.
 */
function buildMinimalPdf(textContent?: string): Uint8Array {
  const streamBody = textContent
    ? `BT /F1 12 Tf 72 720 Td (${textContent}) Tj ET`
    : '';
  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamBody, 'utf8')} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }
  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Uint8Array(Buffer.from(pdf, 'utf8'));
}

describe('PDF upload validation and extraction', () => {
  it('accepts and extracts text from a valid PDF', async () => {
    const bytes = buildMinimalPdf('Push Day Bench Press 4x8');
    validatePdfUpload({
      fileName: 'workout-plan.pdf',
      fileType: 'application/pdf',
      size: bytes.length,
      bytes,
    });
    const text = await extractTextFromPdfBytes(bytes);
    assert.match(text, /Push Day Bench Press 4x8/);
  });

  it('rejects a non-PDF file with status 400', () => {
    const bytes = new Uint8Array(Buffer.from('plain text file', 'utf8'));
    assert.throws(
      () =>
        validatePdfUpload({
          fileName: 'notes.txt',
          fileType: 'text/plain',
          size: bytes.length,
          bytes,
        }),
      (err: unknown) => err instanceof PdfImportError && err.status === 400
    );
  });

  it('rejects an oversized PDF (> 2 MB) with status 413', () => {
    const bytes = new Uint8Array(MAX_PDF_SIZE_BYTES + 10);
    bytes.set(Buffer.from('%PDF-1.4', 'utf8'), 0);
    assert.throws(
      () =>
        validatePdfUpload({
          fileName: 'huge.pdf',
          fileType: 'application/pdf',
          size: bytes.length,
          bytes,
        }),
      (err: unknown) => err instanceof PdfImportError && err.status === 413
    );
  });

  it('rejects a PDF with no extractable text (scanned/empty) with status 422', async () => {
    const bytes = buildMinimalPdf();
    await assert.rejects(
      () => extractTextFromPdfBytes(bytes),
      (err: unknown) => err instanceof PdfImportError && err.status === 422
    );
  });
});
