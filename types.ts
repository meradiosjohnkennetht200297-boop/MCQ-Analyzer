
export interface ItemResponse {
  studentId: string;
  responses: Record<string, string>; // itemID -> answer (e.g., 'A')
  totalScore: number;
}

export interface ItemAnalysis {
  itemId: string;
  correctAnswer: string;
  difficultyIndex: number; // p-value (0 to 1)
  discriminationIndex: number; // D index (-1 to 1)
  distractorCounts: Record<string, number>;
  distractorFrequencies: Record<string, number>;
  flags: string[];
  pointBiserial?: number;
}

export interface TestReliability {
  kr20: number;
  kr21: number;
  meanScore: number;
  medianScore: number;
  modeScore: number[];
  stdDev: number;
  minScore: number;
  maxScore: number;
  range: number;
  itemCount: number;
  studentCount: number;
  avgDifficulty: number;
  avgDiscrimination: number;
}

export interface AnalysisResults {
  items: ItemAnalysis[];
  reliability: TestReliability;
  rawResponses: ItemResponse[];
}

export interface Thresholds {
  difficulty: { min: number; max: number };
  discrimination: { min: number };
  groupPercentage: number; // Percentage of students in top/bottom groups (e.g., 0.27)
}
