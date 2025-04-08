
import { toast } from 'sonner';

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
  let lessonDurationMinutes = "45";
  
  if (lessonDuration === '30') {
    exerciseCount = 4;
    lessonDurationMinutes = "30";
  } else if (lessonDuration === '60') {
    exerciseCount = 8;
    lessonDurationMinutes = "60";
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
  
  // Build a more detailed, structured prompt for better quality worksheets
  let prompt = `
You are an expert English language teacher creating a highly specific, professional worksheet for a ${lessonDurationMinutes}-minute lesson.

TOPIC: ${sanitizeInput(lessonTopic)}
GOAL: ${sanitizeInput(lessonObjective)}
TEACHING PREFERENCES: ${sanitizeInput(preferences)}`;

  // Add optional parameters if provided
  if (studentProfile) {
    prompt += `\nSTUDENT PROFILE: ${sanitizeInput(studentProfile)}`;
  }
  
  if (additionalInfo) {
    prompt += `\nADDITIONAL INFORMATION: ${sanitizeInput(additionalInfo)}`;
  }

  // Enhanced prompt with clear structure guidelines
  prompt += `
Create a professional, context-specific English language worksheet with EXACTLY ${exerciseCount} exercises that follows this precise structure:

## WORKSHEET STRUCTURE:
1. Start with a brief lesson overview (1-2 sentences) highlighting the main focus and structure.
2. Include EXACTLY ${exerciseCount} exercises, clearly numbered as "Exercise 1", "Exercise 2", etc.
3. End with a vocabulary reference section.

## REQUIRED EXERCISE TYPES:
${exerciseList}

## FOR EACH EXERCISE:
1. Clear title (e.g., "Exercise 1: Reading Comprehension")
2. Specific, step-by-step instructions for students
3. EXACTLY 10 items/questions/examples per exercise
4. Content directly relevant to ${sanitizeInput(lessonTopic)} with industry-specific terminology
5. FOR TEACHER VIEW ONLY: 
   - All correct answers clearly marked
   - Teaching tips with methodological advice
   - Estimated time allocation for the exercise
   - Common student difficulties and how to address them

## VOCABULARY REFERENCE SECTION:
- Include EXACTLY 15 key terms and their definitions related to ${sanitizeInput(lessonTopic)}
- Format in a clear, structured list with examples of usage where appropriate
- Ensure vocabulary is directly relevant to the professional context

## QUALITY REQUIREMENTS:
- Use professional, error-free language appropriate for teaching
- Include industry-specific vocabulary and terminology throughout
- Design exercises that progressively increase in difficulty
- Balance receptive skills (reading, listening) and productive skills (writing, speaking)
- Ensure all content can realistically be completed in ${lessonDurationMinutes} minutes
- Make the worksheet ready-to-use with minimal editing required

Format the entire worksheet as clearly structured text with proper exercise numbering, spacing, and formatting for easy readability.`;

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
    
    // Get API key from session storage
    const apiKey = sessionStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error("No API key found. Please provide an OpenAI API key in the settings.");
    }
    
    // Construct the sanitized prompt
    const prompt = buildPrompt(params);
    
    // Call OpenAI API with security headers and proper error handling
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educational content creator for English language teaching with extensive experience creating worksheets for various industries and language levels. Create professional, pedagogically sound teaching materials that follow current best practices in language education. Focus on creating authentic, engaging content that addresses the specific topic, goals and preferences provided. Include practical activities that develop all language skills while maintaining relevance to the specified professional context. Format your response as a neatly structured document that could be directly printed and used in class.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
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
