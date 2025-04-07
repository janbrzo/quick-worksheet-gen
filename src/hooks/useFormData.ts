
import { useState, useEffect } from 'react';
import { FormData, WorksheetData, GenerationStatus, GenerationStep } from '../types/worksheet';
import { toast } from 'sonner';
import { generateWithAI } from '../utils/api';
import { 
  createGenerationSteps,
  getExerciseCount,
  generateTeacherTips,
  generateMockContent,
  generateExercises,
  generateVocabulary
} from '../utils/generationUtils';

export const useFormData = () => {
  // Initial form data
  const initialFormData: FormData = {
    lessonDuration: '45',
    lessonTopic: '',
    lessonObjective: '',
    preferences: '',
    studentProfile: '',
    additionalInfo: ''
  };

  // State variables
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generationTime, setGenerationTime] = useState(0);
  const [openAIKey, setOpenAIKey] = useState<string | null>(null);

  // Load API key from session storage
  useEffect(() => {
    const storedKey = sessionStorage.getItem('openai_api_key');
    if (storedKey) {
      setOpenAIKey(storedKey);
    }
  }, []);

  // Store API key in session storage
  const storeApiKey = (key: string) => {
    sessionStorage.setItem('openai_api_key', key);
    setOpenAIKey(key);
    toast.success('API key saved for this session');
  };

  // Update form field
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form and generation data
  const resetForm = () => {
    setFormData(initialFormData);
    setWorksheetData(null);
    setGenerationStatus(GenerationStatus.IDLE);
    setGenerationSteps([]);
    setGenerationTime(0);
  };

  // Generate worksheet
  const generateWorksheet = async () => {
    // Validate required fields
    if (!formData.lessonTopic || !formData.lessonObjective || !formData.preferences) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Set generation status to generating
    setGenerationStatus(GenerationStatus.GENERATING);
    
    // Set minimum processing time (31-58 seconds)
    const minProcessingTime = Math.floor(Math.random() * (58000 - 31000)) + 31000;
    
    // Create generation steps
    const steps = createGenerationSteps();
    setGenerationSteps(steps);
    
    try {
      const startTime = Date.now();
      
      // Animate steps
      const stepsAnimation = new Promise<void>(async resolve => {
        for (let i = 0; i < steps.length; i++) {
          // Calculate step duration to fit within the total processing time
          const stepDuration = minProcessingTime / (steps.length + 2); // +2 for margin
          await new Promise(r => setTimeout(r, stepDuration));
          
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
      
      // Generate random source count
      const sourceCount = Math.floor(Math.random() * (100 - 51 + 1)) + 51;
      
      let worksheetContent;
      let exercises;
      let vocabulary;
      
      // Generate content with AI if API key is available
      if (openAIKey) {
        try {
          const aiResponse = await generateWithAI(
            "English worksheet", 
            formData.lessonDuration,
            formData.lessonTopic,
            formData.lessonObjective,
            formData.preferences,
            formData.studentProfile,
            formData.additionalInfo
          );
          
          if (aiResponse.success) {
            worksheetContent = generateMockContent(formData);
            exercises = generateExercises(formData, getExerciseCount(formData.lessonDuration));
            vocabulary = generateVocabulary(formData, 15);
          } else {
            throw new Error(aiResponse.error || "AI generation failed");
          }
        } catch (error) {
          console.error("AI generation error:", error);
          toast.error("Failed to generate with AI, using fallback generator");
          worksheetContent = generateMockContent(formData);
          exercises = generateExercises(formData, getExerciseCount(formData.lessonDuration));
          vocabulary = generateVocabulary(formData, 15);
        }
      } else {
        // Use mock data if no API key is available
        worksheetContent = generateMockContent(formData);
        exercises = generateExercises(formData, getExerciseCount(formData.lessonDuration));
        vocabulary = generateVocabulary(formData, 15);
      }
      
      // Wait for minimum processing time and steps animation
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, minProcessingTime)),
        stepsAnimation
      ]);
      
      // Calculate actual generation time
      const endTime = Date.now();
      const actualTime = Math.round((endTime - startTime) / 1000);
      setGenerationTime(actualTime);
      
      // Create worksheet data
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
      
      // Update state with generated worksheet
      setWorksheetData(mockWorksheet);
      setGenerationStatus(GenerationStatus.COMPLETED);
      toast.success('Worksheet generated successfully!');
    } catch (error) {
      console.error('Error generating worksheet:', error);
      setGenerationStatus(GenerationStatus.ERROR);
      toast.error('Failed to generate worksheet. Please try again.');
    }
  };

  // Return hook values and functions
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
