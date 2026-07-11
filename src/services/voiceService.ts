// Initialize the web worker
const worker = new Worker(new URL('./voiceWorker.ts', import.meta.url), {
  type: 'module',
});

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      // Decode audio on the main thread because AudioContext isn't available in workers
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);

      // Listen for the specific response from the worker
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'TRANSCRIPTION_SUCCESS') {
          worker.removeEventListener('message', handleMessage);
          resolve(event.data.text);
        } else if (event.data.type === 'TRANSCRIPTION_ERROR') {
          worker.removeEventListener('message', handleMessage);
          reject(new Error(event.data.error));
        }
      };

      worker.addEventListener('message', handleMessage);

      // Send the decoded audio data to the worker
      worker.postMessage({ type: 'TRANSCRIBE', audioData });

    } catch (err) {
      console.error('Failed to decode or send audio:', err);
      reject(err);
    }
  });
};
