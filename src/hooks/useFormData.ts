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
      
      // Ensure we have the correct number of exercises based on lesson duration
      const requiredExerciseCount = getExerciseCount(formData.lessonDuration);
      
      // Map exercises to our Exercise interface
      let mappedExercises: Exercise[] = [];
      if (jsonData.exercises && Array.isArray(jsonData.exercises)) {
        mappedExercises = jsonData.exercises.slice(0, requiredExerciseCount).map((exercise: any) => {
          // Ensure each exercise has required properties
          let exerciseContent = exercise.content || "";
          
          // Check if we need to add more questions to reach 10
          let questions = exercise.questions || [];
          if (questions.length < 10 && Array.isArray(questions)) {
            // Fill up to 10 questions
            for (let i = questions.length; i < 10; i++) {
              questions.push({
                text: `Question ${i+1} about ${formData.lessonTopic}?`,
                answer: `Sample answer ${i+1}`
              });
            }
          }
          
          // Check if we need to add more items for matching exercises
          let items = exercise.items || [];
          if (items.length < 10 && Array.isArray(items)) {
            // Fill up to 10 items
            for (let i = items.length; i < 10; i++) {
              items.push({
                term: `Term ${i+1}`,
                definition: `Definition ${i+1} related to ${formData.lessonTopic}`
              });
            }
          }
          
          // Check if we need to add more sentences for fill-in-blanks
          let sentences = exercise.sentences || [];
          if (sentences.length < 10 && Array.isArray(sentences)) {
            // Fill up to 10 sentences
            for (let i = sentences.length; i < 10; i++) {
              sentences.push({
                text: `Sentence ${i+1} with a _____ to fill.`,
                answer: `word${i+1}`
              });
            }
          }
          
          return {
            title: exercise.title || "Exercise",
            type: exercise.type || "other",
            instructions: exercise.instructions || "",
            content: exerciseContent,
            teacherAnswers: exercise.teacher_tip || "",
            duration: exercise.time || 5,
            icon: exercise.icon,
            questions: questions,
            items: items,
            word_bank: exercise.word_bank || [],
            sentences: sentences,
            dialogue: exercise.dialogue || [],
            expressions: exercise.expressions || [],
            expression_instruction: exercise.expression_instruction || "",
            teacher_tip: exercise.teacher_tip || ""
          };
        });
      }
      
      // If we don't have enough exercises, generate more
      if (mappedExercises.length < requiredExerciseCount) {
        const additionalExercises = generateExercises(
          formData, 
          requiredExerciseCount - mappedExercises.length
        );
        mappedExercises = [...mappedExercises, ...additionalExercises];
      }
      
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
        
        // Ensure we have exactly 15 vocabulary items
        if (vocabularyItems.length < 15) {
          // Generate more vocabulary items
          const additionalVocabulary = generateVocabulary(formData, 15 - vocabularyItems.length);
          vocabularyItems = [...vocabularyItems, ...additionalVocabulary];
        } else if (vocabularyItems.length > 15) {
          // Trim excess vocabulary items
          vocabularyItems = vocabularyItems.slice(0, 15);
        }
      } else {
        // Generate all vocabulary items if none were provided
        vocabularyItems = generateVocabulary(formData, 15);
      }
      
      // Build the worksheet data
      const processedData: WorksheetData = {
        title: jsonData.title || `Worksheet: ${formData.lessonTopic}`,
        subtitle: jsonData.subtitle || "",
        introduction: jsonData.introduction || "",
        content: jsonData.introduction || generateMockContent(formData),
        teacherNotes: generateTeacherTips(formData),
        exercises: mappedExercises,
        vocabulary: vocabularyItems,
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
    
    // Generate random processing time (21-49 seconds)
    const minProcessingTime = Math.floor(Math.random() * (49000 - 21000)) + 21000;
    
    // Create generation steps
    const steps = createGenerationSteps();
    setGenerationSteps(steps);
    
    try {
      const startTime = Date.now();
      
      // We'll only show one step at a time
      let currentStepIndex = 0;
      
      // Animate steps one at a time
      const stepsAnimation = new Promise<void>(async resolve => {
        const totalSteps = steps.length;
        const timePerStep = minProcessingTime / totalSteps;
        
        const updateNextStep = async () => {
          if (currentStepIndex < totalSteps) {
            // Mark current step as completed
            setGenerationSteps(prev => {
              const updated = [...prev];
              updated[currentStepIndex].completed = true;
              return updated;
            });
            
            // Move to next step
            currentStepIndex++;
            
            // Update elapsed time
            const currentTime = Math.round((Date.now() - startTime) / 1000);
            setGenerationTime(currentTime);
            
            // Wait for the next step's turn
            if (currentStepIndex < totalSteps) {
              setTimeout(updateNextStep, timePerStep);
            } else {
              resolve();
            }
          }
        };
        
        // Start the first step update
        setTimeout(updateNextStep, timePerStep);
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
        new Promise(resolve => setTimeout(resolve, minProcessingTime)),
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
