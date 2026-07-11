import { getAllAnalytics } from './analyticsDb';
import type { AnalyticsRecord } from './analyticsDb';

export interface NemesisPayload {
  chapterId: string;
  weight: number;
  failureRatio: number;
  totalAttempts: number;
}

export const getHighestWeightChapters = async (limit: number = 5): Promise<NemesisPayload[]> => {
  const analyticsData: AnalyticsRecord[] = await getAllAnalytics();

  if (!analyticsData || analyticsData.length === 0) {
    return [];
  }

  const payload: NemesisPayload[] = analyticsData.map((record) => {
    // Calculate failure ratio. If totalAttempts is 0, ratio is 0 to avoid Infinity/NaN
    const failureRatio = record.totalAttempts > 0 ? record.errorCount / record.totalAttempts : 0;

    // Weight calculation could be more complex in the future.
    // For now, failure ratio acts as the primary weight, with totalAttempts as a secondary factor
    // to prioritize chapters with more data over those with just a single failure.
    // E.g., Weight = failureRatio * log(totalAttempts + 1) or similar.
    // Keeping it simple: weight is the failureRatio for now.
    const weight = failureRatio;

    return {
      chapterId: record.chapterId,
      weight,
      failureRatio,
      totalAttempts: record.totalAttempts,
    };
  });

  // Sort descending by weight (failure ratio)
  payload.sort((a, b) => b.weight - a.weight);

  return payload.slice(0, limit);
};
