
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
  
  // Build the prompt using the template provided
  let prompt = `
Create a professional English language worksheet for a ${formattedDuration} lesson.

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

  // Determine the number of exercises based on lesson duration
  let exerciseCount = 6;
  if (formattedDuration.includes("30")) {
    exerciseCount = 4;
  } else if (formattedDuration.includes("60")) {
    exerciseCount = 8;
  }

  prompt += `
The worksheet should contain ${exerciseCount} exercises suitable for the given time frame. 
Create a structured, comprehensive worksheet that is ready to use immediately.

Your response must be in JSON format with the following structure:

\`\`\`json
{
    "title": "Main title of the worksheet (typically the topic)",
    "subtitle": "Subtitle (typically the goal)",
    "introduction": "Brief 1-2 sentence introduction to the worksheet explaining what students will practice",
    "exercises": [
        {
            "type": "reading",
            "title": "Exercise 1: Reading",
            "time": 8,
            "icon": "fa-book-open",
            "instructions": "Read the following text and then answer the questions below.",
            "content": "<p><strong>Title</strong></p><p>Paragraph 1...</p><p>Paragraph 2...</p>",
            "questions": [
                {"text": "Question 1?", "answer": "Answer 1"}
                // More questions...
            ],
            "teacher_tip": "Tip for teachers about how to use this exercise effectively"
        },
        {
            "type": "matching",
            "title": "Exercise 2: Vocabulary Matching",
            "time": 7,
            "icon": "fa-link",
            "instructions": "Match each term with its correct definition.",
            "items": [
                {"term": "1. Term", "definition": "A. Definition"}
                // More items...
            ],
            "teacher_tip": "Tip for teachers about using this matching exercise"
        },
        {
            "type": "fill-in-blanks",
            "title": "Exercise 3: Fill in the Blanks",
            "time": 8,
            "icon": "fa-pencil-alt",
            "instructions": "Complete the sentences with the correct words from the box.",
            "word_bank": ["word1", "word2", "word3"],
            "sentences": [
                {"text": "This sentence has a _____ to fill.", "answer": "word1"}
                // More sentences...
            ],
            "teacher_tip": "Tip for teachers about this fill-in-the-blanks exercise"
        },
        {
            "type": "multiple-choice",
            "title": "Exercise 4: Multiple Choice",
            "time": 7,
            "icon": "fa-check-square",
            "instructions": "Choose the best option to complete each sentence.",
            "questions": [
                {
                    "text": "Question text with a blank ________.",
                    "options": [
                        {"label": "A", "text": "Option A", "correct": false},
                        {"label": "B", "text": "Option B", "correct": true},
                        {"label": "C", "text": "Option C", "correct": false},
                        {"label": "D", "text": "Option D", "correct": false}
                    ]
                }
                // More questions...
            ],
            "teacher_tip": "Tip for teachers about using this multiple choice exercise"
        },
        {
            "type": "dialogue",
            "title": "Exercise 5: Speaking Practice",
            "time": 10,
            "icon": "fa-comments",
            "instructions": "Practice the following dialogue with a partner. Then create your own similar conversation.",
            "dialogue": [
                {"speaker": "Person A", "text": "Line of dialogue"},
                {"speaker": "Person B", "text": "Response"}
                // More dialogue lines...
            ],
            "expression_instruction": "Now create your own dialogue using these expressions:",
            "expressions": ["Expression 1", "Expression 2", "Expression 3"],
            "teacher_tip": "Tip for teachers about this dialogue exercise"
        },
        {
            "type": "discussion",
            "title": "Exercise 6: Discussion",
            "time": 5,
            "icon": "fa-question-circle",
            "instructions": "Discuss the following questions with your partner or in small groups.",
            "questions": [
                "Discussion question 1?"
                // More questions...
            ],
            "teacher_tip": "Tip for teachers about facilitating discussion"
        }
        // Add more exercises based on exercise_count
    ],
    "vocabulary_sheet": [
        {"term": "Term 1", "meaning": "Definition 1"},
        {"term": "Term 2", "meaning": "Definition 2"}
        // At least 15 vocabulary items related to the topic
    ]
}
\`\`\`

Important requirements:
1. All exercises must be directly related to the topic and goal
2. Each exercise should have 8-10 items (questions, matches, etc.)
3. Include varied exercise types (reading, vocabulary, speaking, etc.)
4. Vocabulary sheet should have at least 15 important terms/phrases
5. All teacher tips should be practical and helpful
6. You must follow the exact JSON structure provided
7. Use proper escaping for quotes and special characters in JSON
8. Don't use placeholder comments like "// More questions..." - include actual content
9. All content should be professional and ready to use in a language classroom
10. Exercise durations should be appropriate for the activity type

Generate a complete worksheet in this JSON format that would be ready to use in a language classroom.
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
