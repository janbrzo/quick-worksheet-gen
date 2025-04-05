
import { useState } from 'react';
import { FormData, WorksheetData, GenerationStatus, Exercise } from '../types/worksheet';
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
      // Simulate API call with longer delay
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      // This is where you would call the actual API
      const mockWorksheet: WorksheetData = {
        title: `Worksheet: ${formData.lessonTopic}`,
        content: generateMockContent(formData),
        teacherNotes: generateTeacherTips(formData),
        exercises: generateExercises(formData)
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

  // Generate teacher tips based on form data
  const generateTeacherTips = (data: FormData): string => {
    return `
## Teacher Tips for ${data.lessonTopic}

1. **Preparation**: Review key vocabulary before the lesson. Consider preparing visual aids for complex concepts in ${data.lessonTopic.split(':')[1] || 'this topic'}.

2. **Warmer**: Begin with a quick discussion about students' experience with ${data.lessonTopic.split(':')[0]} to activate schema and gauge existing knowledge.

3. **Scaffolding**: For the speaking exercises, consider providing sentence starters for lower-level students.

4. **Differentiation**: 
   - Stronger students: Ask them to expand answers with justifications
   - Weaker students: Allow use of vocabulary notes during activities

5. **Feedback**: Prioritize communication over accuracy for speaking tasks, but correct crucial errors in ${data.lessonTopic.split(':')[1] || 'this topic'} terminology.

6. **Extension**: If time permits, encourage students to role-play a scenario involving ${data.lessonTopic.split(':')[1] || 'this topic'}.

7. **Follow-up**: Consider assigning a short writing task using the vocabulary from today's lesson as homework.

8. **Cultural context**: Be aware that concepts around ${data.lessonTopic.split(':')[0]} may differ between cultures, so encourage students to share their perspectives.
`;
  };

  // Generate multiple structured exercises based on lesson duration
  const generateExercises = (data: FormData): Exercise[] => {
    const exerciseCount = data.lessonDuration === '30' ? 4 : 
                          data.lessonDuration === '45' ? 6 : 8;
    
    const exerciseTypes: Exercise['type'][] = [
      'vocabulary', 'reading', 'writing', 'speaking', 'grammar', 'listening'
    ];
    
    return Array.from({ length: exerciseCount }, (_, i) => {
      const type = exerciseTypes[i % exerciseTypes.length];
      return {
        title: `Exercise ${i+1}: ${capitalizeFirst(type)} - ${generateExerciseTitle(type, data)}`,
        instructions: generateInstructions(type, data),
        content: generateExerciseContent(type, data),
        type: type
      };
    });
  };

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const generateExerciseTitle = (type: Exercise['type'], data: FormData): string => {
    const topic = data.lessonTopic.split(':')[1] || data.lessonTopic;
    
    switch(type) {
      case 'vocabulary':
        return `Key Terms in ${topic}`;
      case 'reading':
        return `Professional Text Analysis`;
      case 'writing':
        return `Structured Response`;
      case 'speaking':
        return `Guided Discussion`;
      case 'grammar':
        return `Functional Language Practice`;
      case 'listening':
        return `Comprehension Task`;
      default:
        return `Practice with ${topic}`;
    }
  };

  const generateInstructions = (type: Exercise['type'], data: FormData): string => {
    const topic = data.lessonTopic.split(':')[1] || data.lessonTopic;
    
    switch(type) {
      case 'vocabulary':
        return `Match these key terms related to ${topic} with their definitions. Then use each term in a sentence of your own.`;
      case 'reading':
        return `Read the following text about ${topic} and answer the questions below.`;
      case 'writing':
        return `Write a short paragraph (50-80 words) about ${topic} using at least 5 terms from the vocabulary exercise.`;
      case 'speaking':
        return `Discuss these questions with a partner about ${topic}. Take turns and try to use the vocabulary from this lesson.`;
      case 'grammar':
        return `Complete these sentences using the correct grammatical form. Pay attention to the context related to ${topic}.`;
      case 'listening':
        return `Listen to your teacher read the text and fill in the missing words.`;
      default:
        return `Complete the following exercise related to ${topic}.`;
    }
  };

  const generateExerciseContent = (type: Exercise['type'], data: FormData): string => {
    const topic = data.lessonTopic.split(':')[1] || data.lessonTopic;
    const field = data.lessonTopic.split(':')[0] || 'professional';
    
    // Always generate 10 items per exercise
    switch(type) {
      case 'vocabulary':
        return generateVocabularyItems(field, topic, 10);
      case 'reading':
        return generateReadingText(field, topic, 10);
      case 'writing':
        return generateWritingPrompts(field, topic, 10);
      case 'speaking':
        return generateSpeakingQuestions(field, topic, 10);
      case 'grammar':
        return generateGrammarExercise(field, topic, 10);
      case 'listening':
        return generateListeningExercise(field, topic, 10);
      default:
        return generateGenericExercise(field, topic, 10);
    }
  };

  // Helper functions to generate different types of exercise content
  const generateVocabularyItems = (field: string, topic: string, count: number): string => {
    const terms = [
      "implementation", "protocol", "framework", "infrastructure", 
      "optimization", "methodology", "integration", "functionality", 
      "specification", "configuration", "deployment", "interface", 
      "validation", "authentication", "scalability"
    ];
    
    const definitions = [
      "The process of putting a decision or plan into effect",
      "A set of rules governing data exchange between devices",
      "An essential supporting structure",
      "The action of making the best use of resources",
      "A system of methods used in an activity",
      "The process of combining parts into a whole",
      "The quality of being useful or practical",
      "A detailed description of design criteria",
      "The arrangement of functional units according to their nature",
      "The action of installing equipment or software",
      "A point where two systems meet and interact",
      "The process of checking validity or accuracy",
      "The process of verifying identity",
      "The capability to be changed in size or scale"
    ];
    
    let result = "## Key Vocabulary\n\n";
    
    for (let i = 0; i < count; i++) {
      const termIndex = i % terms.length;
      result += `${i+1}. **${terms[termIndex]}** - ${definitions[termIndex]} (related to ${field} ${topic})\n\n`;
    }
    
    return result;
  };

  const generateReadingText = (field: string, topic: string, paragraphCount: number): string => {
    const intro = `## ${field} ${topic}: Industry Perspectives\n\n`;
    let paragraphs = '';
    
    for (let i = 0; i < paragraphCount; i++) {
      paragraphs += `Paragraph ${i+1}: This text would contain professional information about ${field} with specific focus on ${topic}. It would include relevant terminology and concepts used in the industry, presenting realistic scenarios and challenges that professionals might encounter. The language would be appropriate for business or technical contexts, depending on the field.\n\n`;
    }
    
    return intro + paragraphs + "\n## Comprehension Questions\n\n" + 
      Array.from({ length: Math.min(10, paragraphCount) }, (_, i) => 
        `${i+1}. Question related to paragraph ${i+1} about ${topic}?\n`
      ).join('\n');
  };

  const generateWritingPrompts = (field: string, topic: string, count: number): string => {
    const prompts = [
      `Explain the importance of ${topic} in ${field}`,
      `Compare two different approaches to ${topic}`,
      `Describe a typical process involving ${topic}`,
      `Outline the challenges faced when implementing ${topic}`,
      `Analyze the benefits of improving ${topic} processes`,
      `Suggest solutions to common problems with ${topic}`,
      `Evaluate the effectiveness of current ${topic} methods`,
      `Summarize recent developments in ${topic}`,
      `Discuss how technology has changed ${topic}`,
      `Predict future trends in ${topic}`
    ];
    
    return "## Writing Tasks\n\n" + 
      Array.from({ length: count }, (_, i) => 
        `${i+1}. ${prompts[i % prompts.length]} (50-80 words)\n`
      ).join('\n');
  };

  const generateSpeakingQuestions = (field: string, topic: string, count: number): string => {
    const questions = [
      `What experience do you have with ${topic}?`,
      `How is ${topic} approached in your company?`,
      `What challenges have you faced with ${topic}?`,
      `How do you think ${topic} will evolve in the next 5 years?`,
      `Can you describe a situation where ${topic} was crucial to success?`,
      `What skills are most important when dealing with ${topic}?`,
      `How does ${topic} differ across various industries?`,
      `What's the most common misconception about ${topic}?`,
      `How do cultural differences affect approaches to ${topic}?`,
      `What resources would you recommend for learning more about ${topic}?`
    ];
    
    return "## Discussion Questions\n\n" + 
      Array.from({ length: count }, (_, i) => 
        `${i+1}. ${questions[i % questions.length]}\n`
      ).join('\n');
  };

  const generateGrammarExercise = (field: string, topic: string, count: number): string => {
    const sentences = [
      `If the company (implement) ________ this new system, productivity will increase.`,
      `They (work) ________ on this project for three months when the deadline was extended.`,
      `We (not complete) ________ the analysis by the time the meeting starts.`,
      `She (attend) ________ all the workshops last year to improve her skills.`,
      `The team (discuss) ________ various approaches before they made a decision.`,
      `You (need) ________ to submit your report before Friday.`,
      `By next month, they (finish) ________ the initial phase of the project.`,
      `If I (be) ________ in your position, I would consider a different strategy.`,
      `The company (not announce) ________ the new policy until all employees are informed.`,
      `We (prefer) ________ to resolve this issue before proceeding to the next stage.`
    ];
    
    return "## Grammar Practice\n\n" + 
      Array.from({ length: count }, (_, i) => 
        `${i+1}. ${sentences[i % sentences.length]}\n`
      ).join('\n');
  };

  const generateListeningExercise = (field: string, topic: string, count: number): string => {
    const sentences = [
      `The project manager emphasized the importance of ________ when discussing ${topic}.`,
      `According to the expert, the main challenge of ${topic} is ________.`,
      `The new approach to ${topic} focuses primarily on ________.`,
      `During the conference, they highlighted that successful ${topic} depends on ________.`,
      `The latest research shows that ${topic} can be improved by ________.`,
      `Industry leaders agree that the future of ${topic} will include more ________.`,
      `The most common mistake companies make with ${topic} is ________.`,
      `A strategic approach to ${topic} should always consider ________.`,
      `The case study demonstrated how ${topic} contributed to ________.`,
      `Experts recommend that beginners in ${topic} should first learn about ________.`
    ];
    
    return "## Listening Activity\n\n" + 
      Array.from({ length: count }, (_, i) => 
        `${i+1}. ${sentences[i % sentences.length]}\n`
      ).join('\n');
  };

  const generateGenericExercise = (field: string, topic: string, count: number): string => {
    return "## Practice Activities\n\n" + 
      Array.from({ length: count }, (_, i) => 
        `${i+1}. Activity ${i+1} related to ${field} ${topic}\n`
      ).join('\n');
  };

  // This function generates placeholder content for demonstration
  const generateMockContent = (data: FormData): string => {
    return `
# ${data.lessonTopic} - ${data.lessonObjective}

## Overview
This worksheet focuses on ${data.lessonTopic} with the objective of ${data.lessonObjective}. 
It contains exercises tailored for a ${data.lessonDuration}-minute lesson, with emphasis on ${data.preferences}.
${data.studentProfile ? `\nDesigned for students who: ${data.studentProfile}` : ''}
${data.additionalInfo ? `\nSpecial considerations: ${data.additionalInfo}` : ''}

## Lesson Structure
* Warm-up Discussion (${data.lessonDuration === '30' ? '5' : data.lessonDuration === '45' ? '7' : '10'} minutes)
* Vocabulary Introduction (${data.lessonDuration === '30' ? '5' : data.lessonDuration === '45' ? '8' : '10'} minutes)
* Main Activities (${data.lessonDuration === '30' ? '15' : data.lessonDuration === '45' ? '25' : '35'} minutes)
* Review and Wrap-up (5 minutes)
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
