
import { toast } from 'sonner';

// Remove the hardcoded API key and get it from the function parameter
export const generateWithAI = async (
  prompt: string, 
  duration: string, 
  topic: string, 
  objective: string, 
  preferences: string, 
  studentProfile?: string, 
  additionalInfo?: string
) => {
  try {
    // Get the API key from session storage
    const apiKey = sessionStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      return {
        success: false,
        content: null,
        error: "No API key available. Please provide an OpenAI API key."
      };
    }
    
    // Determine the exercise count based on lesson duration
    let exerciseCount = 6; // Default for 45 minutes
    let lessonDurationMinutes = "45";
    
    if (duration === '30') {
      exerciseCount = 4;
      lessonDurationMinutes = "30";
    } else if (duration === '60') {
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
    
    // For 60-min lessons, add 2 more exercise types
    let finalExerciseTypes = [...exerciseTypes];
    if (exerciseCount === 8) {
      finalExerciseTypes.push("Error Correction", "Role-play Scenario with Key Expressions");
    }
    
    // For 30-min lessons, use only the first 4 exercise types
    if (exerciseCount === 4) {
      finalExerciseTypes = exerciseTypes.slice(0, 4);
    }
    
    // Format the exercise list for the prompt
    const exerciseList = finalExerciseTypes.map(type => `- ${type}`).join("\n");
    
    // Build enhanced, comprehensive prompt for better worksheet generation
    const fullPrompt = `
You are an expert English language teacher creating a highly specific, professional worksheet for a ${lessonDurationMinutes}-minute lesson.

TOPIC: ${topic}
GOAL: ${objective}
TEACHING PREFERENCES: ${preferences}
${studentProfile ? `STUDENT PROFILE: ${studentProfile}` : ''}
${additionalInfo ? `ADDITIONAL INFORMATION: ${additionalInfo}` : ''}

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
4. Content directly relevant to ${topic} with industry-specific terminology
5. FOR TEACHER VIEW ONLY: 
   - All correct answers clearly marked
   - Teaching tips with methodological advice
   - Estimated time allocation for the exercise
   - Common student difficulties and how to address them

## VOCABULARY REFERENCE SECTION:
- Include EXACTLY 15 key terms and their definitions related to ${topic}
- Format in a clear, structured list with examples of usage where appropriate
- Ensure vocabulary is directly relevant to the professional context

## QUALITY REQUIREMENTS:
- Use professional, error-free language appropriate for teaching
- Include industry-specific vocabulary and terminology throughout
- Design exercises that progressively increase in difficulty
- Balance receptive skills (reading, listening) and productive skills (writing, speaking)
- Ensure all content can realistically be completed in ${lessonDurationMinutes} minutes
- Make the worksheet ready-to-use with minimal editing required

Format the entire worksheet as clearly structured text with proper exercise numbering, spacing, and formatting for easy readability.
`;

    // OpenAI request configuration
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "You are an expert English language teacher specializing in creating professional, industry-specific worksheets. Your worksheets are always structured with clear sections, exercises designed in a logical progression, and include vocabulary and activities specific to the requested topic. Always create complete, ready-to-use worksheets with 10 items per exercise and practical teaching tips. Format your response as a neatly structured document that could be directly printed and used in class."
          },
          {
            role: "user",
            content: fullPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    };

    // Make the request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("No content received from AI service");
    }
    
    return {
      success: true,
      content: data.choices[0].message.content,
      error: null
    };
    
  } catch (error) {
    console.error("OpenAI API Error:", error);
    toast.error(`Failed to generate worksheet with AI: ${error.message || 'Unknown error'}`);
    return {
      success: false,
      content: null,
      error: error.message
    };
  }
};
