
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
  teacherNotes?: string;
}
