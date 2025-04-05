
export interface FormData {
  lessonDuration: '30' | '45' | '60';
  lessonTopic: string;
  lessonObjective: string;
  preferences: string;
  studentProfile?: string;
  additionalInfo?: string;
}

export interface TileSelectorProps {
  tiles: string[];
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export enum GenerationStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface WorksheetData {
  title: string;
  content: string;
  teacherNotes: string;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  generationTime: number;
  sourceCount: number;
}

export interface Exercise {
  title: string;
  instructions: string;
  content: string;
  type: 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'grammar';
  teacherAnswers?: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example?: string;
}

export interface FeedbackData {
  rating: number;
  comment: string;
}

export enum WorksheetView {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface GenerationStep {
  text: string;
  completed: boolean;
}
