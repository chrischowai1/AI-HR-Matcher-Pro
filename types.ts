
export interface CompetencyDimension {
  name: string;
  score: number;
}

export interface AnalysisResult {
  filename: string;
  match_score: number;
  summary: string;
  dimensions: CompetencyDimension[];
  pros: string[];
  cons: string[];
  interview_questions: string[];
}

export interface FileData {
  id: string;
  name: string;
  text: string;
  type: 'pdf' | 'docx' | 'txt';
}

export enum AppStatus {
  IDLE = 'IDLE',
  PARSING = 'PARSING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
