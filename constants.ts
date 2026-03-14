
import { Thresholds } from './types';

export const DEFAULT_THRESHOLDS: Thresholds = {
  difficulty: { min: 0.25, max: 0.75 }, // Updated to 0.25 - 0.75 as requested
  discrimination: { min: 0.2 },       
  groupPercentage: 0.27,              
};

export const SAMPLE_CSV_TEMPLATE = `StudentID,Q1,Q2,Q3,Q4,Q5
KEY,A,B,C,D,A
Student1,A,B,C,D,A
Student2,A,C,C,B,A
Student3,B,B,C,D,C
Student4,A,B,A,D,A
Student5,C,B,C,A,B
Student6,A,B,C,D,A`;
