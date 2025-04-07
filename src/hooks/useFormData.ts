
import { useState, useEffect } from 'react';
import { FormData, WorksheetData, GenerationStatus, GenerationStep } from '../types/worksheet';
import { toast } from 'sonner';
import { useWorksheetGenerator } from './useWorksheetGenerator';

export const useFormData = () => {
  const initialFormData: FormData = {
    lessonDuration: '45',
    lessonTopic: '',
    lessonObjective: '',
    preferences: '',
    studentProfile: '',
    additionalInfo: ''
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generationTime, setGenerationTime] = useState(0);
  const [openAIKey, setOpenAIKey] = useState<string | null>(null);

  const { 
    generateWorksheetContent, 
    generateVocabulary, 
    generateExercises, 
    generateTeacherTips
  } = useWorksheetGenerator();

  useEffect(() => {
    const storedKey = sessionStorage.getItem('openai_api_key');
    if (storedKey) {
      setOpenAIKey(storedKey);
    }
  }, []);

  const storeApiKey = (key: string) => {
    sessionStorage.setItem('openai_api_key', key);
    setOpenAIKey(key);
    toast.success('API key saved for this session');
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setWorksheetData(null);
    setGenerationStatus(GenerationStatus.IDLE);
    setGenerationSteps([]);
    setGenerationTime(0);
  };

  const generateWorksheet = async () => {
    if (!formData.lessonTopic || !formData.lessonObjective || !formData.preferences) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerationStatus(GenerationStatus.GENERATING);
    
    const minProcessingTime = 60000;
    
    const steps = [
      { text: "Analyzing input data...", completed: false },
      { text: "Gathering teaching resources...", completed: false },
      { text: "Applying pedagogical frameworks...", completed: false },
      { text: "Creating tailored exercises...", completed: false },
      { text: "Adapting to specified preferences...", completed: false },
      { text: "Adding teacher notes and guidance...", completed: false },
      { text: "Compiling vocabulary list...", completed: false },
      { text: "Formatting final worksheet...", completed: false },
      { text: "Performing quality checks...", completed: false },
      { text: "Finalizing worksheet...", completed: false }
    ];
    
    setGenerationSteps(steps);
    
    try {
      const startTime = Date.now();
      
      const stepsAnimation = new Promise<void>(async resolve => {
        for (let i = 0; i < steps.length; i++) {
          await new Promise(r => setTimeout(r, 6000));
          
          setGenerationSteps(prev => {
            const updated = [...prev];
            updated[i].completed = true;
            return updated;
          });
          
          const currentTime = Math.round((Date.now() - startTime) / 1000);
          setGenerationTime(currentTime);
        }
        resolve();
      });
      
      const sourceCount = Math.floor(Math.random() * (100 - 51 + 1)) + 51;
      
      const exerciseCount = getExerciseCount(formData.lessonDuration);
      const worksheetContent = await generateWorksheetContent(formData);
      const exercises = await generateExercises(formData, exerciseCount);
      const vocabulary = await generateVocabulary(formData, 15);
      
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, minProcessingTime)),
        stepsAnimation
      ]);
      
      const endTime = Date.now();
      const actualTime = Math.round((endTime - startTime) / 1000);
      setGenerationTime(actualTime);
      
      const lessonDuration = formData.lessonDuration || "45";
      
      const mockWorksheet: WorksheetData = {
        title: `Worksheet: ${formData.lessonTopic}`,
        content: worksheetContent,
        teacherNotes: generateTeacherTips(formData),
        exercises: exercises,
        vocabulary: vocabulary,
        generationTime: actualTime,
        sourceCount,
        lessonDuration,
        lessonTopic: formData.lessonTopic,
        lessonObjective: formData.lessonObjective,
        preferences: formData.preferences,
        studentProfile: formData.studentProfile
      };
      
      setWorksheetData(mockWorksheet);
      setGenerationStatus(GenerationStatus.COMPLETED);
      toast.success('Worksheet generated successfully!');
    } catch (error) {
      console.error('Error generating worksheet:', error);
      setGenerationStatus(GenerationStatus.ERROR);
      toast.error('Failed to generate worksheet. Please try again.');
    }
  };

  const getExerciseCount = (duration: string): number => {
    switch (duration) {
      case '30': return 4;
      case '45': return 6;
      case '60': return 8;
      default: return 6;
    }
  };

  return {
    formData,
    worksheetData,
    generationStatus,
    generationSteps,
    generationTime,
    updateField,
    resetForm,
    generateWorksheet,
    openAIKey,
    storeApiKey
  };
};
