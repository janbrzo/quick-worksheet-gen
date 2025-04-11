
import { toast } from 'sonner';
import { FormData } from '@/types/worksheet';

// Maximum number of API calls allowed per user session to prevent abuse
const MAX_API_CALLS_PER_SESSION = 5;
// Store API call count to limit usage per session
let apiCallCount = 0;

// Additional security - only allow a set frequency of calls 
const API_CALL_COOLDOWN_MS = 10000; // 10 seconds between calls
let lastApiCallTime = 0;

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

// Create the optimized JSON prompt based on the user's form data
const buildJsonPrompt = (params: FormData): string => {
  const {
    lessonDuration,
    lessonTopic,
    lessonObjective,
    preferences,
    studentProfile = "",
    additionalInfo = ""
  } = params;
  
  // Convert lessonDuration to format used in prompt
  let formattedDuration = "45 minutes";
  
  if (lessonDuration === '30') {
    formattedDuration = "30 minutes";
  } else if (lessonDuration === '60') {
    formattedDuration = "60 minutes";
  }
  
  // Determine the number of exercises based on lesson duration
  let exerciseCount = 6;
  if (formattedDuration.includes("30")) {
    exerciseCount = 4;
  } else if (formattedDuration.includes("60")) {
    exerciseCount = 8;
  }
  
  // Build the prompt using the template provided
  let prompt = `
You are an expert English language teacher creating a specific, high-quality worksheet.
Create a professional, context-specific, structured, comprehensive English language worksheet that is ready to use immediately.
Worksheet is for a ${formattedDuration} lesson.
The worksheet must contain ${exerciseCount} exercises suitable for the given time frame.
Each exercise must include exactly 10 questions/items/sentences as appropriate

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

  prompt += `
Your response must be in JSON format with the following structure:

\`\`\`json
{
  "title": "Topic title",
  "subtitle": "Goal description",
  "introduction": "Brief 1-2 sentence overview of the worksheet",
  "exercises": [
    {
      "type": "reading",
      "title": "Exercise 1: Reading",
      "icon": "fa-book-open",
      "time": 8,
      "instructions": "Read the following text and then answer the questions below.",
      "content": "Reading passage with 4-5 paragraphs related to the topic...",
      "questions": [
        {"text": "Question 1?", "answer": "Answer 1"},
        {"text": "Question 2?", "answer": "Answer 2"},
        // Include 10 questions total
      ],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    },
    {
      "type": "matching",
      "title": "Exercise 2: Vocabulary Matching",
      "icon": "fa-link",
      "time": 7,
      "instructions": "Match each term with its correct definition.",
      "items": [
        {"term": "Term 1", "definition": "Definition A"},
        {"term": "Term 2", "definition": "Definition B"},
        // Include 10 matching items total
      ],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    },
    {
      "type": "fill-in-blanks",
      "title": "Exercise 3: Fill in the Blanks",
      "icon": "fa-pencil-alt",
      "time": 8,
      "instructions": "Complete each sentence with the correct word from the box.",
      "word_bank": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10"],
      "sentences": [
        {"text": "Sentence with a _____ to fill.", "answer": "word1"},
        {"text": "Another sentence with a _____ to fill.", "answer": "word2"},
        // Include 10 sentences total
      ],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    },
    {
      "type": "multiple-choice",
      "title": "Exercise 4: Multiple Choice",
      "icon": "fa-check-square",
      "time": 7,
      "instructions": "Choose the best option to complete each sentence.",
      "questions": [
        {
          "text": "Question text with blank to fill",
          "options": [
            {"label": "A", "text": "Option A", "correct": false},
            {"label": "B", "text": "Option B", "correct": false},
            {"label": "C", "text": "Option C", "correct": true},
            {"label": "D", "text": "Option D", "correct": false}
          ]
        },
        // Include 10 multiple-choice questions total
      ],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    },
    {
      "type": "dialogue",
      "title": "Exercise 5: Speaking Practice",
      "icon": "fa-comments",
      "time": 10,
      "instructions": "Practice the following dialogue with a partner. Then create your own similar conversation.",
      "dialogue": [
        {"speaker": "Person A", "text": "First line of dialogue"},
        {"speaker": "Person B", "text": "Response to first line"},
        // Include 8-10 lines of dialogue
      ],
      "expression_instruction": "Now create your own dialogue using these expressions:",
      "expressions": ["Expression 1", "Expression 2", "Expression 3", "Expression 4", "Expression 5", 
                     "Expression 6", "Expression 7", "Expression 8", "Expression 9", "Expression 10"],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    },
    {
      "type": "discussion",
      "title": "Exercise 6: Discussion",
      "icon": "fa-question-circle",
      "time": 5,
      "instructions": "Discuss the following questions with your partner or in small groups.",
      "questions": [
        "Discussion question 1?",
        "Discussion question 2?",
        // Include 10 discussion questions total
      ],
      "teacher_tip": "Advice for teachers on how to use this exercise effectively"
    }
  ],
  "vocabulary_sheet": [
    {"term": "Term 1", "meaning": "Definition of term 1"},
    {"term": "Term 2", "meaning": "Definition of term 2"},
    // Include 15 vocabulary items total
  ]
}
\`\`\`

Important guidelines:
1. Use the exact JSON structure shown above
2. For 30-minute lessons, create 4 exercises; for 45-minute lessons, create 6 exercises; for 60-minute lessons, create 8 exercises
3. Each exercise MUST include exactly 10 questions/items/sentences as appropriate - this is a strict requirement!
4. All exercises should be closely related to the specified topic and goal
5. Include specific vocabulary, expressions, and language structures related to the topic
6. Ensure the vocabulary sheet at the end contains 15 key terms with clear definitions
7. Keep exercise instructions clear and concise
8. For each exercise, include a "teacher_tip" with practical advice for conducting the activity
9. Use the appropriate exercise icon for each type as shown in the examples

Make sure the final output is valid JSON format that can be parsed properly. Do not include explanations or commentary outside the JSON structure.
`;

  return prompt;
};

// Secure OpenAI API call with rate limiting and protections
export const generateWorksheetWithAI = async (params: FormData): Promise<any> => {
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
    
    // Construct the sanitized prompt using the JSON format
    const prompt = buildJsonPrompt(params);
    
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
            content: 'You are an expert educational content creator for English language teaching with extensive experience creating worksheets. Create professional, well-structured teaching materials in valid JSON format exactly as requested, with no additional text outside the JSON.' 
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
    
    // Process the AI response - extract JSON from the content
    const aiContent = data.choices[0].message.content;
    
    // Extract JSON content from the response (it might be wrapped in markdown code blocks)
    let jsonContent = aiContent;
    const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
      jsonContent = jsonMatch[1];
    }
    
    // Try to parse the JSON
    try {
      const parsedJson = JSON.parse(jsonContent);
      return parsedJson;
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      console.log('Raw content received:', aiContent);
      throw new Error('The AI generated invalid JSON. Please try again.');
    }
    
  } catch (error) {
    console.error('Worksheet generation error:', error);
    toast.error(error.message || 'Error generating worksheet. Please try again later.');
    throw error;
  }
};
