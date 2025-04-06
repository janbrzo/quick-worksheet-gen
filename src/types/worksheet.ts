
export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum WorksheetView {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER'
}

export interface FormData {
  lessonDuration: string;
  lessonTopic: string;
  lessonObjective: string;
  preferences: string;
  studentProfile?: string;
  additionalInfo?: string;
}

export interface Exercise {
  title: string;
  instructions: string;
  content: string;
  type?: string;
  teacherAnswers?: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example: string;
}

export interface GenerationStep {
  text: string;
  completed: boolean;
}

export interface WorksheetData {
  title: string;
  content: string;
  teacherNotes?: string;
  exercises: Exercise[];
  vocabulary?: VocabularyItem[];
  generationTime?: number;
  sourceCount?: number;
  lessonDuration?: string;
}

export interface FeedbackData {
  rating: number;
  comment: string;
}

export interface TileSelectorProps {
  tiles: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
