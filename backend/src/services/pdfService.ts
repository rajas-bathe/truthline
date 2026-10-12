import pdfParse from 'pdf-parse';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../security/logger';

export interface PdfExtractionResult {
  text: string;
  numPages: number;
  info?: any;
  isScanned?: boolean;
  method: 'node_pdf_parse' | 'python_pymupdf';
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<PdfExtractionResult> {
  // 1. Primary: node pdf-parse
  try {
    const data = await pdfParse(buffer);
    const cleanText = (data.text || '').trim();
    const numPages = data.numpages || 1;

    // Check if document appears to be a scanned image-only PDF (very few characters per page)
    const isScanned = cleanText.length < 50 && numPages >= 1;

    logger.info(`Parsed PDF with pdf-parse: ${numPages} pages, ${cleanText.length} characters (isScanned: ${isScanned})`);

    return {
      text: cleanText,
      numPages,
      info: data.info,
      isScanned,
      method: 'node_pdf_parse'
    };
  } catch (err: any) {
    logger.warn(`pdf-parse failed (${err.message}). Attempting Python PyMuPDF fallback...`);
    return tryPyMuPdfExtraction(buffer);
  }
}

/**
 * Fallback to PyMuPDF via Python service script
 */
async function tryPyMuPdfExtraction(buffer: Buffer): Promise<PdfExtractionResult> {
  const tempPath = path.join(__dirname, `../../temp_pdf_${Date.now()}.pdf`);

  try {
    fs.writeFileSync(tempPath, buffer);
    const scriptPath = path.join(__dirname, 'pdf_extractor.py');

    return await new Promise((resolve, reject) => {
      execFile('python', [scriptPath, tempPath], (err, stdout) => {
        if (err) {
          return reject(new Error(`Python PyMuPDF execution failed: ${err.message}`));
        }

        try {
          const json = JSON.parse(stdout);
          if (!json.success) {
            return reject(new Error(json.error || 'PyMuPDF extraction failed'));
          }

          resolve({
            text: (json.text || '').trim(),
            numPages: json.pageCount || 1,
            info: json.metadata,
            isScanned: (json.text || '').trim().length < 50,
            method: 'python_pymupdf'
          });
        } catch (parseErr: any) {
          reject(new Error(`Failed to parse Python output: ${parseErr.message}`));
        }
      });
    });
  } finally {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }
}
