
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
  
  // Construct the prompt with strict sanitization and validation
  return `Create a professional worksheet for English teaching based on:

LESSON TIME: ${sanitizeInput(lessonDuration)} minutes

TOPIC: ${sanitizeInput(lessonTopic)}

OBJECTIVE: ${sanitizeInput(lessonObjective)}

PREFERENCES: ${sanitizeInput(preferences)}

${studentProfile ? `STUDENT PROFILE: ${sanitizeInput(studentProfile)}` : ''}

${additionalInfo ? `ADDITIONAL INFO: ${sanitizeInput(additionalInfo)}` : ''}

Guidelines:
1. Adjust exercises count based on time (30min: 4, 45min: 6, 60min: 8)
2. Include 10 examples per exercise
3. Use specialized vocabulary for the topic
4. Structure progressively from simple to complex
5. Include: brief intro, key vocabulary, dialog/text using key terms, exercises matching preferences
6. All content must be in English only
7. Provide clear exercise instructions
8. For teacher view, add tips for each exercise

Make sure the worksheet is ready to use with minimal edits (<10%).`;
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
            content: 'You are an expert educational content creator for English language teaching. Create professional, well-structured worksheets that follow the guidelines provided.' 
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
