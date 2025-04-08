
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
  type: 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'grammar' | 'listening' | 'dialogue' | 'discussion' | 'matching' | 'fill-in-blanks' | 'multiple-choice';
  teacherAnswers?: string;
  duration?: number; // Duration field in minutes
  time?: number; // New field for time in minutes from JSON structure
  icon?: string; // Icon class for the exercise
  questions?: any[]; // Questions array for various exercise types
  items?: any[]; // Items for matching exercises
  word_bank?: string[]; // Word bank for fill-in-blanks
  sentences?: any[]; // Sentences for fill-in-blanks
  dialogue?: any[]; // Dialogue lines for speaking exercises
  expressions?: string[]; // Expressions for dialogue exercises
  expression_instruction?: string; // Instruction for expressions
  teacher_tip?: string; // Teacher tip for the exercise
}

export interface VocabularyItem {
  term: string;
  definition: string;
  example?: string;
}

export interface WorksheetData {
  title: string;
  subtitle?: string; // New field for subtitle
  introduction?: string; // New field for introduction
  content: string;
  teacherNotes: string;
  exercises: Exercise[];
  vocabulary?: VocabularyItem[];
  vocabulary_sheet?: any[]; // New field for vocabulary sheet from JSON
  generationTime: number;
  sourceCount: number;
  lessonDuration: string;
  lessonTopic: string;
  lessonObjective: string;
  preferences: string;
  studentProfile?: string;
  additionalInfo?: string;
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
