import { createWorker } from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

export const initOCRWorker = async () => {
  if (worker) return worker;

  // Create worker configured to use local data from /public/tesseract-data/
  worker = await createWorker('eng+equ', 1, {
    workerPath: '/tesseract-assets/worker.min.js',
    corePath: '/tesseract-assets/tesseract-core.wasm.js',
    langPath: '/tesseract-data', // Load from local public folder
  });

  return worker;
};

export const performOCR = async (base64Image: string): Promise<string> => {
  try {
    const w = await initOCRWorker();
    const { data } = await w.recognize(base64Image);
    return data.text;
  } catch (err) {
    console.error('OCR Error:', err);
    throw err;
  }
};
