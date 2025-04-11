import { toast } from 'sonner';
import { FormData, WorksheetData, GenerationStatus, Exercise, VocabularyItem, GenerationStep } from '@/types/worksheet';
import { generateWithAI } from './api';

// Generates worksheet steps with random timing
export function createGenerationSteps(): GenerationStep[] {
  return [
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
}

// Calculates optimal exercise count based on lesson duration
export function getExerciseCount(duration: string): number {
  switch (duration) {
    case '30': return 4;
    case '45': return 6;
    case '60': return 8;
    default: return 6;
  }
}

// Generates teacher tips for the worksheet
export function generateTeacherTips(data: FormData): string {
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
}

// Generates mock content for the worksheet overview
export function generateMockContent(data: FormData): string {
  return `
# ${data.lessonTopic} - ${data.lessonObjective}

## Overview
This worksheet focuses on ${data.lessonTopic} with the objective of ${data.lessonObjective}. 
It contains exercises tailored for a ${data.lessonDuration}-minute lesson, with emphasis on ${data.preferences}.
${data.studentProfile ? `\nDesigned for students who: ${data.studentProfile}` : ''}
${data.additionalInfo ? `\nSpecial considerations: ${data.additionalInfo}` : ''}
`;
}

// Generates vocabulary items for the worksheet
export function generateVocabulary(data: FormData, count: number): VocabularyItem[] {
  const terms = [
    "implementation", "protocol", "framework", "infrastructure", 
    "optimization", "methodology", "integration", "functionality", 
    "specification", "configuration", "deployment", "interface", 
    "validation", "authentication", "scalability", "compliance",
    "optimization", "procedure", "regulation", "certification",
    "standard", "guideline", "requirement", "benchmark", "evaluation"
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
    "The capability to be changed in size or scale",
    "The state of adhering to regulations or guidelines",
    "The process of making the best use of resources",
    "An established way of doing something",
    "A rule or directive made and maintained",
    "The action of providing an official document",
    "A level of quality or attainment",
    "A general rule or principle",
    "A necessary condition",
    "A standard by which something can be measured",
    "The process of assessing or estimating the nature, quality, or ability"
  ];
  
  const examples = [
    `The ${data.lessonTopic.split(':')[0]} team is responsible for the implementation of the new system.`,
    `The protocol must be followed to ensure data security.`,
    `This framework provides a foundation for all our ${data.lessonTopic.split(':')[0]} processes.`,
    `The company invested in infrastructure to support future growth.`,
    `Their optimization strategies reduced costs by 30%.`,
    `The methodology they use has proven successful in similar cases.`,
    `System integration is critical for this project's success.`,
    `This new functionality will improve user experience.`,
    `The specification document details all requirements.`,
    `The system configuration needs to be adjusted for optimal performance.`,
    `Deployment of the new software will take place next week.`,
    `The user interface was redesigned for better usability.`,
    `Data validation is essential to maintain accuracy.`,
    `Two-factor authentication provides additional security.`,
    `The scalability of the system allows for future expansion.`
  ];
  
  const result: VocabularyItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const termIndex = i % terms.length;
    result.push({
      term: terms[termIndex],
      definition: definitions[termIndex],
      example: examples[i % examples.length]
    });
  }
  
  return result;
}

// Generate exercises for the worksheet
export function generateExercises(data: FormData, count: number): Exercise[] {
  const exerciseTypes: Exercise['type'][] = [
    'vocabulary', 'reading', 'writing', 'speaking', 'grammar', 'listening'
  ];
  
  // Calculate time per exercise based on total lesson duration
  const lessonDuration = parseInt(data.lessonDuration || '45');
  const timePerExercise = Math.floor(lessonDuration / count);
  
  return Array.from({ length: count }, (_, i) => {
    const type = exerciseTypes[i % exerciseTypes.length];
    return {
      title: `Exercise ${i+1}: ${capitalizeFirst(type)} - ${generateExerciseTitle(type, data)}`,
      instructions: generateInstructions(type, data),
      content: generateExerciseContent(type, data),
      type: type,
      teacherAnswers: generateTeacherAnswers(type, data),
      duration: timePerExercise // Adding duration in minutes
    };
  });
}

// Helper to capitalize the first letter of a string
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate a title for an exercise based on type
export function generateExerciseTitle(type: Exercise['type'], data: FormData): string {
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
}

// Generate instructions for an exercise based on type
export function generateInstructions(type: Exercise['type'], data: FormData): string {
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
}

// Generate exercise content based on type
export function generateExerciseContent(type: Exercise['type'], data: FormData): string {
  const topic = data.lessonTopic.split(':')[1] || data.lessonTopic;
  const field = data.lessonTopic.split(':')[0] || 'professional';
  
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
}

// Generate vocabulary items for an exercise
export function generateVocabularyItems(field: string, topic: string, count: number): string {
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
}

// Generate reading text for an exercise
export function generateReadingText(field: string, topic: string, paragraphCount: number): string {
  const intro = `## ${field} ${topic}: Industry Perspectives\n\n`;
  let paragraphs = '';
  
  for (let i = 0; i < paragraphCount; i++) {
    paragraphs += `Paragraph ${i+1}: This text would contain professional information about ${field} with specific focus on ${topic}. It would include relevant terminology and concepts used in the industry, presenting realistic scenarios and challenges that professionals might encounter. The language would be appropriate for business or technical contexts, depending on the field.\n\n`;
  }
  
  return intro + paragraphs + "\n## Comprehension Questions\n\n" + 
    Array.from({ length: Math.min(10, paragraphCount) }, (_, i) => 
      `${i+1}. Question related to paragraph ${i+1} about ${topic}?\n`
    ).join('\n');
}

// Generate writing prompts for an exercise
export function generateWritingPrompts(field: string, topic: string, count: number): string {
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
}

// Generate speaking questions for an exercise
export function generateSpeakingQuestions(field: string, topic: string, count: number): string {
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
}

// Generate grammar exercises
export function generateGrammarExercise(field: string, topic: string, count: number): string {
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
}

// Generate listening exercise
export function generateListeningExercise(field: string, topic: string, count: number): string {
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
}

// Generate generic exercise
export function generateGenericExercise(field: string, topic: string, count: number): string {
  return "## Practice Activities\n\n" + 
    Array.from({ length: count }, (_, i) => 
      `${i+1}. Activity ${i+1} related to ${field} ${topic}\n`
    ).join('\n');
}

// Generate teacher answers for an exercise
export function generateTeacherAnswers(type: Exercise['type'], data: FormData): string {
  const topic = data.lessonTopic.split(':')[1] || data.lessonTopic;
  
  switch(type) {
    case 'vocabulary':
      return "**Vocabulary Answers:**\n1. implementation - The process of putting a decision or plan into effect\n2. protocol - A set of rules governing data exchange\n3. framework - An essential supporting structure\n...";
    case 'grammar':
      return "**Grammar Answers:**\n1. implements\n2. had been working\n3. will not have completed\n4. attended\n5. discussed\n...";
    case 'listening':
      return "**Listening Answers:**\n1. communication\n2. time management\n3. customer feedback\n4. team collaboration\n5. quality control\n...";
    case 'reading':
      return "**Reading Answers:**\n1. The author suggests that improved communication is essential\n2. Three main benefits mentioned are efficiency, quality, and client satisfaction\n...";
    default:
      return `**Suggested answers for ${type} exercise:**\nMultiple correct answers are possible. Look for appropriate use of key terms and concepts related to ${topic}.`;
  }
}
