export interface WeaknessRecord {
  topic: string;
  wrongCount: number;
  correctCount: number;
}

export const logAnswerResult = (topic: string, isCorrect: boolean) => {
  const data = localStorage.getItem('ethiolearn_analytics');
  const records: { [key: string]: WeaknessRecord } = data ? JSON.parse(data) : {};

  if (!records[topic]) {
    records[topic] = { topic, wrongCount: 0, correctCount: 0 };
  }

  if (isCorrect) records[topic].correctCount += 1;
  else records[topic].wrongCount += 1;

  localStorage.setItem('ethiolearn_analytics', JSON.stringify(records));
};

export const getTopicHealth = (topic: string): number => {
  const data = localStorage.getItem('ethiolearn_analytics');
  if (!data) return 100;
  const records = JSON.parse(data);
  const record = records[topic];
  if (!record) return 100;
  
  const total = record.correctCount + record.wrongCount;
  return Math.round((record.correctCount / total) * 100);
};