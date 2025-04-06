
import { toast } from 'sonner';

const OPENAI_API_KEY = "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"; 

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
    // Determine the exercise count based on lesson duration
    let exerciseCount = 6; // Default for 45 minutes
    
    if (duration === '30') {
      exerciseCount = 4;
    } else if (duration === '60') {
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
    
    // Build a comprehensive and detailed prompt for better worksheet generation
    const fullPrompt = `
You are creating a professional English language worksheet for a ${duration}-minute lesson.

TOPIC: ${topic}
GOAL: ${objective}
TEACHING PREFERENCES: ${preferences}
${studentProfile ? `STUDENT PROFILE: ${studentProfile}` : ''}
${additionalInfo ? `ADDITIONAL INFORMATION: ${additionalInfo}` : ''}

Create an English language worksheet with EXACTLY ${exerciseCount} exercises for this ${duration}-minute lesson.

Include the following exercise types:
${exerciseList}

For EACH exercise:
1. Include a clear title
2. Add appropriate instructions
3. Create EXACTLY 10 items/questions/examples in each exercise
4. Include correct answers visible only in teacher view
5. Add a teaching tip section with practical advice for the teacher

At the end of the worksheet, include a "Vocabulary Sheet" section with EXACTLY 15 key terms and their definitions, displayed in a structured format.

Make sure all content is relevant to the topic and goal, and adapted to the specified lesson time.
`;

    // OpenAI request configuration
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "You are an expert English language teacher specializing in creating professional, industry-specific worksheets. Your worksheets are always structured with clear sections, exercises designed in a logical progression, and include vocabulary and activities specific to the requested topic. Always create complete, ready-to-use worksheets with 10 items per exercise and practical teaching tips."
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
    const data = await response.json();
    
    // Process the response
    if (data.error) {
      throw new Error(data.error.message || "Error generating worksheet");
    }
    
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
    toast.error("Failed to generate worksheet with AI. Using fallback method.");
    return {
      success: false,
      content: null,
      error: error.message
    };
  }
};
