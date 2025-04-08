
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

  // Parse AI-generated content to extract exercises, vocabulary, etc.
  const parseAIContent = (content: string, formData: FormData) => {
    try {
      // Simple parsing for now - in a real implementation, this would be more sophisticated
      const contentLines = content.split('\n');
      
      // Extract title based on the first heading
      const title = contentLines.find(line => line.match(/^#/))?.replace(/^#+ /, '') || `Worksheet: ${formData.lessonTopic}`;
      
      // Extract overview (first paragraph after title)
      const overviewIndex = contentLines.findIndex(line => line.match(/^#/));
      let overview = '';
      if (overviewIndex >= 0) {
        for (let i = overviewIndex + 1; i < contentLines.length; i++) {
          if (contentLines[i].trim() && !contentLines[i].match(/^#/)) {
            overview = contentLines[i];
            break;
          }
        }
      }
      
      // Try to extract exercises - looking for "Exercise" headings
      const exercises = [];
      let currentExercise = null;
      let inVocabularySection = false;
      const vocabularyItems = [];
      
      for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i];
        
        // Check for exercise heading
        if (line.match(/Exercise \d+:/i) || line.match(/^## Exercise \d+:/i)) {
          // Save previous exercise if exists
          if (currentExercise) {
            exercises.push(currentExercise);
          }
          
          // Create new exercise
          const title = line.replace(/^##? /, '');
          currentExercise = {
            title,
            type: determineExerciseType(title),
            content: '',
            instructions: '',
            teacherAnswers: '',
            duration: Math.floor(Math.random() * 10) + 5 + ' min'
          };
          
          // Look for instructions on the next lines
          for (let j = i + 1; j < contentLines.length && j < i + 5; j++) {
            if (contentLines[j].trim() && !contentLines[j].match(/^#/)) {
              currentExercise.instructions = contentLines[j];
              break;
            }
          }
          
          // Collect content until next exercise or vocabulary section
          let contentStart = i + 1;
          let contentEnd = contentLines.length;
          for (let j = i + 1; j < contentLines.length; j++) {
            if (contentLines[j].match(/Exercise \d+:/i) || 
                contentLines[j].match(/^## Exercise \d+:/i) ||
                contentLines[j].match(/vocabulary reference/i) || 
                contentLines[j].match(/^## vocabulary/i)) {
              contentEnd = j;
              break;
            }
          }
          
          currentExercise.content = contentLines.slice(contentStart, contentEnd).join('\n');
          
          // Extract teacher answers if possible (look for "Teacher" or "Answer" sections)
          const teacherIndex = currentExercise.content.indexOf('Teacher');
          const answerIndex = currentExercise.content.indexOf('Answer');
          if (teacherIndex > -1 || answerIndex > -1) {
            const splitIndex = Math.max(teacherIndex, answerIndex);
            if (splitIndex > -1) {
              const teacherContent = currentExercise.content.substring(splitIndex);
              currentExercise.teacherAnswers = teacherContent;
              currentExercise.content = currentExercise.content.substring(0, splitIndex);
            }
          }
          
          i = contentEnd - 1; // Move to the end of this exercise's content
        }
        
        // Check for vocabulary section
        if (line.match(/vocabulary reference/i) || line.match(/^## vocabulary/i)) {
          inVocabularySection = true;
          // Save last exercise if exists
          if (currentExercise) {
            exercises.push(currentExercise);
            currentExercise = null;
          }
          continue;
        }
        
        // Extract vocabulary items
        if (inVocabularySection) {
          // Match patterns like "1. Term - Definition" or "- Term: Definition"
          const vocabMatch = line.match(/(\d+\.\s+|[-*]\s+)([^:]+)(?:[:-]\s+)(.+)/);
          if (vocabMatch) {
            vocabularyItems.push({
              term: vocabMatch[2].trim(),
              definition: vocabMatch[3].trim(),
              example: ''
            });
          }
        }
      }
      
      // Add the last exercise if there is one
      if (currentExercise) {
        exercises.push(currentExercise);
      }
      
      // If we couldn't extract enough vocabulary items, generate some
      if (vocabularyItems.length < 15) {
        const additionalItems = generateVocabulary(formData, 15 - vocabularyItems.length);
        return {
          title,
          content: overview || generateMockContent(formData),
          exercises: exercises.length > 0 ? exercises : generateExercises(formData, getExerciseCount(formData.lessonDuration)),
          vocabulary: [...vocabularyItems, ...additionalItems]
        };
      }
      
      return {
        title,
        content: overview || generateMockContent(formData),
        exercises: exercises.length > 0 ? exercises : generateExercises(formData, getExerciseCount(formData.lessonDuration)),
        vocabulary: vocabularyItems
      };
    } catch (error) {
      console.error("Error parsing AI content:", error);
      // Fallback to mock data in case of parsing errors
      return {
        title: `Worksheet: ${formData.lessonTopic}`,
        content: generateMockContent(formData),
        exercises: generateExercises(formData, getExerciseCount(formData.lessonDuration)),
        vocabulary: generateVocabulary(formData, 15)
      };
    }
  };
  
  // Helper function to determine exercise type from title
  const determineExerciseType = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('vocabulary') || lowerTitle.includes('matching')) {
      return 'vocabulary';
    } else if (lowerTitle.includes('reading') || lowerTitle.includes('comprehension')) {
      return 'reading';
    } else if (lowerTitle.includes('writing') || lowerTitle.includes('fill in')) {
      return 'writing';
    } else if (lowerTitle.includes('grammar') || lowerTitle.includes('structure')) {
      return 'grammar';
    } else if (lowerTitle.includes('listen') || lowerTitle.includes('audio')) {
      return 'listening';
    } else if (lowerTitle.includes('speak') || lowerTitle.includes('discussion')) {
      return 'speaking';
    } else {
      return 'other';
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
      let parsedData;
      
      // Generate content with AI
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
        
        if (aiResponse.success && aiResponse.content) {
          // Here's the key fix: Parse and use the AI content instead of falling back to mock data
          worksheetContent = aiResponse.content;
          parsedData = parseAIContent(worksheetContent, formData);
        } else {
          throw new Error(aiResponse.error || "AI generation failed");
        }
      } catch (error) {
        console.error("AI generation error:", error);
        toast.error("Failed to generate with AI, using fallback generator");
        
        // Fallback to mock data if AI generation fails
        worksheetContent = generateMockContent(formData);
        parsedData = {
          title: `Worksheet: ${formData.lessonTopic}`,
          content: worksheetContent,
          exercises: generateExercises(formData, getExerciseCount(formData.lessonDuration)),
          vocabulary: generateVocabulary(formData, 15)
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
      setGenerationTime(actualTime);
      
      // Create worksheet data
      const mockWorksheet: WorksheetData = {
        title: parsedData.title,
        content: parsedData.content,
        teacherNotes: generateTeacherTips(formData),
        exercises: parsedData.exercises,
        vocabulary: parsedData.vocabulary,
        generationTime: actualTime,
        sourceCount,
        lessonDuration: formData.lessonDuration,
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
