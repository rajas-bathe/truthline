import { createWorker } from 'tesseract.js';
import { logger } from '../security/logger';

let workerPromise: Promise<any> | null = null;

async function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      logger.info('Initializing Tesseract.js OCR engine (Local WASM)...');
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return workerPromise;
}

export async function extractTextFromImageBuffer(buffer: Buffer): Promise<{ text: string; confidence: number }> {
  try {
    const worker = await getOcrWorker();
    const result = await worker.recognize(buffer);
    const text = (result.data.text || '').trim();
    const confidence = result.data.confidence || 0;
    logger.info(`OCR extracted ${text.length} characters with confidence ${confidence.toFixed(1)}%`);
    return { text, confidence };
  } catch (err: any) {
    logger.error('OCR processing error: ' + err.message);
    throw new Error(`Failed to extract text from image: ${err.message}`);
  }
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
    } catch {
      // ignore
    }
    workerPromise = null;
  }
}
