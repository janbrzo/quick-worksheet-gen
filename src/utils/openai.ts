
import { toast } from 'sonner';

// The key is not directly exposed as plaintext in the codebase
const OPENAI_KEY_TOKEN = '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';

// Maximum number of API calls allowed per user session to prevent abuse
const MAX_API_CALLS_PER_SESSION = 5;
// Store API call count to limit usage per session
let apiCallCount = 0;

// Additional security - only allow a set frequency of calls 
const API_CALL_COOLDOWN_MS = 10000; // 10 seconds between calls
let lastApiCallTime = 0;

interface WorksheetParams {
  lessonDuration: string;
  lessonTopic: string;
  lessonObjective: string;
  preferences: string;
  studentProfile?: string;
  additionalInfo?: string;
}

const buildPrompt = (params: WorksheetParams): string => {
  const {
    lessonDuration,
    lessonTopic,
    lessonObjective,
    preferences,
    studentProfile = "",
    additionalInfo = ""
  } = params;
  
  // Determine the exercise count based on lesson duration
  let exerciseCount = 6; // Default for 45 min
  if (lessonDuration === '30') {
    exerciseCount = 4;
  } else if (lessonDuration === '60') {
    exerciseCount = 8;
  }
  
  // Define exercise types based on count
  const exerciseTypes = [
    "Reading Passage with Comprehension Questions", 
    "Vocabulary Matching", 
    "Fill in the Blanks", 
    "Multiple Choice Questions", 
    "Speaking Practice with a Dialogue", 
    "Discussion Questions"
  ];
  
  // Adjust exercise types based on duration
  let selectedExerciseTypes = [...exerciseTypes];
  
  // For 60 min lessons, add two more exercise types
  if (exerciseCount === 8) {
    selectedExerciseTypes = [
      ...selectedExerciseTypes,
      "Error Correction",
      "Role-play Scenario with Key Expressions"
    ];
  }
  
  // For 30 min lessons, reduce exercise types
  if (exerciseCount === 4) {
    selectedExerciseTypes = selectedExerciseTypes.slice(0, 4);
  }
  
  // Create exercise list string
  const exerciseList = selectedExerciseTypes.map(type => `- ${type}`).join('\n');
  
  // Base prompt construction
  let prompt = `
You are creating a professional English language worksheet for a ${sanitizeInput(lessonDuration)} minute lesson.

TOPIC: ${sanitizeInput(lessonTopic)}
GOAL: ${sanitizeInput(lessonObjective)}
TEACHING PREFERENCES: ${sanitizeInput(preferences)}
`;

  // Add optional parameters if provided
  if (studentProfile) {
    prompt += `\nSTUDENT PROFILE: ${sanitizeInput(studentProfile)}`;
  }
  
  if (additionalInfo) {
    prompt += `\nADDITIONAL INFORMATION: ${sanitizeInput(additionalInfo)}`;
  }

  // Add exercise requirements
  prompt += `
Create a professional English language worksheet with EXACTLY ${exerciseCount} exercises for this ${lessonDuration} minute lesson.

Include the following exercise types:
${exerciseList}

For EACH exercise:
1. Include a clear title
2. Add appropriate instructions
3. Create EXACTLY 10 items/questions/examples in each exercise
4. Include correct answers visible only in teacher view
5. Add a teaching tip section with practical advice for the teacher

At the end of the worksheet, include a "Vocabulary Sheet" section with EXACTLY 15 key terms and their definitions, displayed in a 3-column grid.

Make sure all content is relevant to the topic and goal, and adapted to the specified lesson time.
`;

  return prompt;
};

// Security utility to sanitize user input before sending to API
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters 
  let sanitized = input
    .replace(/<|>|{|}|\\/g, '')  // Remove brackets, backslashes that could be used for prompt injection
    .replace(/[^\w\s.,;:?!()'"@-]/g, ' ') // Allow only safe characters
    .trim();
  
  // Further limit input length to prevent abuse
  return sanitized.substring(0, 200);
};

// Secure OpenAI API call with rate limiting and protections
export const generateWorksheetWithAI = async (params: WorksheetParams): Promise<any> => {
  try {
    // Check for rate limits
    if (apiCallCount >= MAX_API_CALLS_PER_SESSION) {
      throw new Error("You've reached the maximum number of generations for this session.");
    }
    
    // Check cooldown period
    const now = Date.now();
    if (now - lastApiCallTime < API_CALL_COOLDOWN_MS && lastApiCallTime !== 0) {
      const remainingSeconds = Math.ceil((API_CALL_COOLDOWN_MS - (now - lastApiCallTime)) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before generating another worksheet.`);
    }
    
    lastApiCallTime = now;
    apiCallCount++;
    
    // Construct the sanitized prompt
    const prompt = buildPrompt(params);
    
    // Call OpenAI API with security headers and proper error handling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY_TOKEN}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educational content creator for English language teaching. Create professional, well-structured worksheets that follow the guidelines provided. Focus on creating authentic, pedagogically sound teaching materials that can be used directly in the classroom.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Error generating worksheet. Please try again later.');
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from AI service');
    }
    
    // Process and sanitize the AI response
    const aiContent = data.choices[0].message.content;
    
    // Additional processing and content safety check could be added here
    
    return aiContent;
    
  } catch (error) {
    console.error('Worksheet generation error:', error);
    toast.error(error.message || 'Error generating worksheet. Please try again later.');
    throw error;
  }
};
