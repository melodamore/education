import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: any = null;

const initVoiceModel = async () => {
  if (transcriber) return transcriber;
  transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
  return transcriber;
};

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent) => {
  if (event.data.type === 'TRANSCRIBE') {
    try {
      const audioData = event.data.audioData; // Float32Array of audio
      const t = await initVoiceModel();
      const result = await t(audioData);
      self.postMessage({ type: 'TRANSCRIPTION_SUCCESS', text: result.text });
    } catch (error: any) {
      self.postMessage({ type: 'TRANSCRIPTION_ERROR', error: error.message });
    }
  }
});
