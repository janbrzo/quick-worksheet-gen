
import { useState } from 'react';
import { FormData, WorksheetData, GenerationStatus } from '../types/worksheet';
import { toast } from 'sonner';

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

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setWorksheetData(null);
    setGenerationStatus(GenerationStatus.IDLE);
  };

  const generateWorksheet = async () => {
    // Validation
    if (!formData.lessonTopic || !formData.lessonObjective || !formData.preferences) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGenerationStatus(GenerationStatus.GENERATING);
    
    try {
      // Simulate API call to OpenAI
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // This is where you would call the actual API
      const mockWorksheet: WorksheetData = {
        title: `Worksheet: ${formData.lessonTopic}`,
        content: generateMockContent(formData),
        teacherNotes: "This is a sample worksheet generated based on your inputs. In the final version, this will contain specialized content created specifically for your requirements."
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

  // This function generates placeholder content for demonstration
  const generateMockContent = (data: FormData): string => {
    return `
## ${data.lessonTopic}

### Objective
${data.lessonObjective}

### Warm-up (${data.lessonDuration === '30' ? '5' : data.lessonDuration === '45' ? '10' : '15'} minutes)
Discussion questions:
1. What experience do you have with ${data.lessonTopic.split(':')[0]}?
2. Why is ${data.lessonTopic.split(':')[1] || 'this topic'} important in your field?
3. What specific challenges do you face when communicating about this in English?

### Vocabulary Focus (${data.lessonDuration === '30' ? '10' : data.lessonDuration === '45' ? '15' : '20'} minutes)
Key terms related to ${data.lessonTopic}:
- Term 1: Definition and example
- Term 2: Definition and example
- Term 3: Definition and example
- Term 4: Definition and example
- Term 5: Definition and example

### Practice Activity (${data.lessonDuration === '30' ? '10' : data.lessonDuration === '45' ? '15' : '20'} minutes)
${data.preferences.includes('Dialogi') ? 'Role-play scenario:' : 
  data.preferences.includes('Quizy') ? 'Quiz:' : 
  data.preferences.includes('pisemne') ? 'Writing exercise:' : 
  data.preferences.includes('Dyskusje') ? 'Group discussion:' : 
  data.preferences.includes('Analiza') ? 'Text analysis:' : 'Exercise:'}

[Specific activity based on the topic and preferences would be generated here]

### Wrap-up (5 minutes)
Reflection questions:
1. What new vocabulary did you learn today?
2. How will you apply this in your work context?
3. What areas would you like to explore further?

`;
  };

  return {
    formData,
    worksheetData,
    generationStatus,
    updateField,
    resetForm,
    generateWorksheet
  };
};
