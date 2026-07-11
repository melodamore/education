import { getAnalytics } from './analyticsDb';

export interface P2PPayload {
  version: string;
  timestamp: number;
  chapterId: string;
  senderId: string;
  notesData: string;
}

export const P2PSyncService = {
  serializePayload: async (chapterId: string, notesData: string): Promise<string> => {
    const senderId = `peer_${Math.random().toString(36).substring(2, 9)}`;
    let analyticsContext = null;
    try {
      analyticsContext = await getAnalytics(chapterId);
    } catch (e) {
      console.warn('Could not fetch analytics for P2P context', e);
    }

    const payload: P2PPayload & { context?: any } = {
      version: '1.0',
      timestamp: Date.now(),
      chapterId,
      senderId,
      notesData,
      ...(analyticsContext && { context: analyticsContext }),
    };

    const stringified = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(stringified)));
    return encoded;
  },

  deserializePayload: (encoded: string): P2PPayload => {
    try {
      const decodedStr = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(decodedStr);
    } catch (err) {
      console.error('Failed to parse incoming P2P payload', err);
      throw new Error('Invalid peer payload');
    }
  },

  mockBroadcast: async (encodedPayload: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('📡 [P2P MOCK] Broadcasting payload size:', encodedPayload.length, 'bytes');
      setTimeout(() => {
        console.log('📡 [P2P MOCK] Broadcast complete.');
        resolve(true);
      }, 800);
    });
  }
};
