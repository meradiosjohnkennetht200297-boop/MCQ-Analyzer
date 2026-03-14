
import { ItemResponse, ItemAnalysis, TestReliability, AnalysisResults, Thresholds } from '../types';

/**
 * Helper to calculate median
 */
const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Helper to calculate mode
 */
const calculateMode = (values: number[]): number[] => {
  if (values.length === 0) return [];
  const freq: Record<number, number> = {};
  let maxFreq = 0;
  values.forEach(v => {
    freq[v] = (freq[v] || 0) + 1;
    if (freq[v] > maxFreq) maxFreq = freq[v];
  });
  return Object.keys(freq)
    .filter(k => freq[Number(k)] === maxFreq)
    .map(Number);
};

export const analyzeAssessment = (
  data: string[][],
  thresholds: Thresholds
): AnalysisResults => {
  if (data.length < 3) throw new Error("Insufficient data: Need header, key, and at least one student.");

  const headers = data[0];
  const validColumnIndices = headers
    .map((h, i) => (i > 0 && h.trim() !== "" ? i : -1))
    .filter(i => i !== -1);

  if (validColumnIndices.length === 0) {
    throw new Error("No question columns identified.");
  }

  const itemIds = validColumnIndices.map(idx => headers[idx]);
  const keyRow = data[1];
  const answerKey: Record<string, string> = {};
  validColumnIndices.forEach((colIdx, listIdx) => {
    const id = itemIds[listIdx];
    answerKey[id] = (keyRow[colIdx] || "").trim();
  });

  const studentRows = data.slice(2);
  const studentResponses: ItemResponse[] = studentRows.map((row) => {
    const studentId = row[0] || "Unknown";
    const responses: Record<string, string> = {};
    let score = 0;

    validColumnIndices.forEach((colIdx, listIdx) => {
      const id = itemIds[listIdx];
      const answer = (row[colIdx] || "").trim();
      responses[id] = answer;
      if (answer !== "" && answer === answerKey[id]) {
        score++;
      }
    });

    return { studentId, responses, totalScore: score };
  });

  const studentCount = studentResponses.length;
  const itemCount = itemIds.length;

  const sortedStudents = [...studentResponses].sort((a, b) => b.totalScore - a.totalScore);
  const groupSize = Math.max(1, Math.floor(studentCount * thresholds.groupPercentage));
  const topGroup = sortedStudents.slice(0, groupSize);
  const bottomGroup = sortedStudents.slice(-groupSize);

  let totalDifficulty = 0;
  let totalDiscrimination = 0;

  const items: ItemAnalysis[] = itemIds.map((itemId) => {
    const correct = answerKey[itemId];
    let correctCount = 0;
    const distractorCounts: Record<string, number> = {};

    studentResponses.forEach((s) => {
      const resp = s.responses[itemId];
      if (resp !== "" && resp === correct) correctCount++;
      if (resp !== "" && resp !== correct) {
        distractorCounts[resp] = (distractorCounts[resp] || 0) + 1;
      }
    });

    const difficultyIndex = studentCount > 0 ? (correctCount / studentCount) : 0;
    const topCorrect = topGroup.filter(s => s.responses[itemId] === correct).length;
    const bottomCorrect = bottomGroup.filter(s => s.responses[itemId] === correct).length;
    const discriminationIndex = studentCount > 0 ? (topCorrect - bottomCorrect) / groupSize : 0;

    totalDifficulty += difficultyIndex;
    totalDiscrimination += discriminationIndex;

    const flags: string[] = [];
    if (difficultyIndex < thresholds.difficulty.min) flags.push("Too Difficult");
    if (difficultyIndex > thresholds.difficulty.max) flags.push("Too Easy");
    if (discriminationIndex < thresholds.discrimination.min) flags.push("Poor Discrimination");
    if (discriminationIndex < 0) flags.push("Negative Discrimination");

    const distractorFrequencies: Record<string, number> = {};
    Object.keys(distractorCounts).forEach(opt => {
      distractorFrequencies[opt] = distractorCounts[opt] / studentCount;
    });

    return {
      itemId,
      correctAnswer: correct,
      difficultyIndex: isNaN(difficultyIndex) ? 0 : difficultyIndex,
      discriminationIndex: isNaN(discriminationIndex) ? 0 : discriminationIndex,
      distractorCounts,
      distractorFrequencies,
      flags
    };
  });

  const scores = studentResponses.map(s => s.totalScore);
  const meanScore = studentCount > 0 ? scores.reduce((a, b) => a + b, 0) / studentCount : 0;
  
  // (1) Sample Variance calculation (n-1)
  const sumDiffSq = scores.reduce((a, b) => a + Math.pow(b - meanScore, 2), 0);
  const variance = studentCount > 1 ? sumDiffSq / (studentCount - 1) : 0;
  const stdDev = Math.sqrt(variance);

  const minScore = studentCount > 0 ? Math.min(...scores) : 0;
  const maxScore = studentCount > 0 ? Math.max(...scores) : 0;

  // KR-20 Calculation
  const sumPQ = items.reduce((sum, item) => sum + (item.difficultyIndex * (1 - item.difficultyIndex)), 0);
  const kr20 = (itemCount > 1 && variance > 0) ? (itemCount / (itemCount - 1)) * (1 - (sumPQ / variance)) : 0;

  // (4) KR-21 Calculation
  // Formula: [k / (k-1)] * [1 - (Mean * (k - Mean) / (k * Variance))]
  const kr21 = (itemCount > 1 && variance > 0) 
    ? (itemCount / (itemCount - 1)) * (1 - (meanScore * (itemCount - meanScore) / (itemCount * variance)))
    : 0;

  const reliability: TestReliability = {
    kr20: isNaN(kr20) ? 0 : kr20,
    kr21: isNaN(kr21) ? 0 : kr21,
    meanScore,
    medianScore: calculateMedian(scores),
    modeScore: calculateMode(scores),
    stdDev,
    minScore,
    maxScore,
    range: maxScore - minScore,
    itemCount,
    studentCount,
    avgDifficulty: totalDifficulty / itemCount,
    avgDiscrimination: totalDiscrimination / itemCount
  };

  return { items, reliability, rawResponses: studentResponses };
};
