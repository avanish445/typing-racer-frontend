export function calculateWPM(charsTyped: number, timeInSeconds: number) {
  if (timeInSeconds <= 0) return 0;
  const minutes = timeInSeconds / 60;
  return Math.round((charsTyped / 5) / minutes);
}

export function calculateNetWPM(charsTyped: number, uncorrectedErrors: number, timeInSeconds: number) {
  if (timeInSeconds <= 0) return 0;
  const minutes = timeInSeconds / 60;
  const rawWPM = (charsTyped / 5) / minutes;
  const netWPM = rawWPM - (uncorrectedErrors / minutes);
  return Math.max(0, Math.round(netWPM));
}

export function calculateAccuracy(correctChars: number, totalChars: number) {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 10000) / 100;
}

export function calculateConsistency(wpmTimeline: { wpm: number }[]) {
  if (wpmTimeline.length < 2) return 100;
  const values = wpmTimeline.map((p: { wpm: number }) => p.wpm);
  const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  const variance = values.reduce((sum: number, v: number) => sum + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return Math.max(0, Math.round(100 - stdDev));
}
