
import { useState, useEffect } from 'react';
import { FormData, WorksheetData, GenerationStatus, GenerationStep, Exercise, VocabularyItem } from '../types/worksheet';
import { toast } from 'sonner';
import { generateWorksheetWithAI } from '../utils/openai';
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

  // Process JSON format from OpenAI into our WorksheetData structure
  const processJsonResponse = (jsonData: any, formData: FormData): WorksheetData => {
    try {
      console.log("Processing JSON data:", jsonData);
      
      // Map exercises to our Exercise interface
      const mappedExercises: Exercise[] = jsonData.exercises.map((exercise: any) => {
        return {
          title: exercise.title || "Exercise",
          type: exercise.type || "other",
          instructions: exercise.instructions || "",
          content: exercise.content || "",
          teacherAnswers: exercise.teacher_tip || "",
          duration: exercise.time || 5,
          icon: exercise.icon,
          questions: exercise.questions,
          items: exercise.items,
          word_bank: exercise.word_bank,
          sentences: exercise.sentences,
          dialogue: exercise.dialogue,
          expressions: exercise.expressions,
          expression_instruction: exercise.expression_instruction,
          teacher_tip: exercise.teacher_tip
        };
      });
      
      // Map vocabulary sheet to our VocabularyItem interface
      let vocabularyItems: VocabularyItem[] = [];
      if (jsonData.vocabulary_sheet && Array.isArray(jsonData.vocabulary_sheet)) {
        vocabularyItems = jsonData.vocabulary_sheet.map((item: any) => {
          return {
            term: item.term || "",
            definition: item.meaning || item.definition || "",
            example: item.example || ""
          };
        });
      }
      
      // Build the worksheet data
      const processedData: WorksheetData = {
        title: jsonData.title || `Worksheet: ${formData.lessonTopic}`,
        subtitle: jsonData.subtitle || "",
        introduction: jsonData.introduction || "",
        content: jsonData.introduction || generateMockContent(formData),
        teacherNotes: generateTeacherTips(formData),
        exercises: mappedExercises.length > 0 ? mappedExercises : generateExercises(formData, getExerciseCount(formData.lessonDuration)),
        vocabulary: vocabularyItems.length > 0 ? vocabularyItems : generateVocabulary(formData, 15),
        vocabulary_sheet: jsonData.vocabulary_sheet,
        generationTime: 0, // Will be set later
        sourceCount: Math.floor(Math.random() * (100 - 51 + 1)) + 51,
        lessonDuration: formData.lessonDuration,
        lessonTopic: formData.lessonTopic,
        lessonObjective: formData.lessonObjective,
        preferences: formData.preferences,
        studentProfile: formData.studentProfile,
        additionalInfo: formData.additionalInfo
      };
      
      return processedData;
    } catch (error) {
      console.error("Error processing JSON data:", error);
      
      // Fallback to mock data in case of processing errors
      return {
        title: `Worksheet: ${formData.lessonTopic}`,
        content: generateMockContent(formData),
        teacherNotes: generateTeacherTips(formData),
        exercises: generateExercises(formData, getExerciseCount(formData.lessonDuration)),
        vocabulary: generateVocabulary(formData, 15),
        generationTime: 0,
        sourceCount: Math.floor(Math.random() * (100 - 51 + 1)) + 51,
        lessonDuration: formData.lessonDuration,
        lessonTopic: formData.lessonTopic,
        lessonObjective: formData.lessonObjective,
        preferences: formData.preferences,
        studentProfile: formData.studentProfile,
        additionalInfo: formData.additionalInfo
      };
    }
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
    
    // Set random processing time between 21-49 seconds
    const processingTime = Math.floor(Math.random() * (49 - 21 + 1)) + 21;
    const processingTimeMs = processingTime * 1000;
    
    // Create generation steps
    const steps = createGenerationSteps();
    setGenerationSteps(steps);
    
    try {
      const startTime = Date.now();
      
      // Animate steps one by one
      const stepsAnimation = new Promise<void>(async resolve => {
        const stepDuration = processingTimeMs / steps.length;
        
        for (let i = 0; i < steps.length; i++) {
          // Set only the current step as active, all previous as completed
          setGenerationSteps(prev => {
            const updated = [...prev];
            // Mark all previous steps as completed
            for (let j = 0; j < i; j++) {
              updated[j].completed = true;
            }
            // Set current step as active
            updated[i].completed = true;
            return updated;
          });
          
          const currentTime = Math.round((Date.now() - startTime) / 1000);
          setGenerationTime(currentTime);
          
          // Wait before showing the next step
          await new Promise(r => setTimeout(r, stepDuration));
        }
        resolve();
      });
      
      let jsonData;
      let worksheetData;
      
      // Generate content with AI
      try {
        // Call the OpenAI function to generate the worksheet JSON
        jsonData = await generateWorksheetWithAI(formData);
        
        if (jsonData) {
          // Process the JSON into our WorksheetData structure
          worksheetData = processJsonResponse(jsonData, formData);
        } else {
          throw new Error("Failed to generate worksheet data");
        }
      } catch (error) {
        console.error("AI generation error:", error);
        toast.error("Failed to generate with AI, using fallback generator");
        
        // Fallback to mock data if AI generation fails
        worksheetData = {
          title: `Worksheet: ${formData.lessonTopic}`,
          content: generateMockContent(formData),
          teacherNotes: generateTeacherTips(formData),
          exercises: generateExercises(formData, getExerciseCount(formData.lessonDuration)),
          vocabulary: generateVocabulary(formData, 15),
          generationTime: 0,
          sourceCount: Math.floor(Math.random() * (100 - 51 + 1)) + 51,
          lessonDuration: formData.lessonDuration,
          lessonTopic: formData.lessonTopic,
          lessonObjective: formData.lessonObjective,
          preferences: formData.preferences,
          studentProfile: formData.studentProfile,
          additionalInfo: formData.additionalInfo
        };
      }
      
      // Wait for minimum processing time and steps animation
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, processingTimeMs)),
        stepsAnimation
      ]);
      
      // Calculate actual generation time
      const endTime = Date.now();
      const actualTime = Math.round((endTime - startTime) / 1000);
      
      // Update the worksheet data with the actual generation time
      worksheetData.generationTime = actualTime;
      
      // Update state with generated worksheet
      setWorksheetData(worksheetData);
      setGenerationStatus(GenerationStatus.COMPLETED);
      setGenerationTime(actualTime);
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
