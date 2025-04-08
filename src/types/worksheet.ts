
export enum WorksheetView {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export enum GenerationStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error'
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
  type: 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'grammar' | 'listening';
  teacherAnswers?: string;
  duration?: number; // Adding duration field in minutes
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example?: string;
}

export interface WorksheetData {
  title: string;
  content: string;
  teacherNotes: string;
  exercises: Exercise[];
  vocabulary?: VocabularyItem[];
  generationTime: number;
  sourceCount: number;
  lessonDuration: string;
  lessonTopic: string;
  lessonObjective: string;
  preferences: string;
  studentProfile?: string;
}

export interface GenerationStep {
  text: string;
  completed: boolean;
}

export interface FeedbackData {
  rating: number;
  comment: string;
}

// Add the missing TileSelectorProps interface
export interface TileSelectorProps {
  tiles: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
