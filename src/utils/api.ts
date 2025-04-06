
// API utility for making OpenAI requests
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
    // Build a comprehensive prompt with all the details
    const fullPrompt = `
Create a professional English teaching worksheet based on the following:

LESSON DURATION: ${duration} minutes

TOPIC: ${topic}

OBJECTIVE: ${objective}

PREFERENCES: ${preferences}

${studentProfile ? `STUDENT PROFILE: ${studentProfile}` : ''}

${additionalInfo ? `ADDITIONAL INFORMATION: ${additionalInfo}` : ''}

Follow these guidelines:

1. Adjust the number of exercises based on lesson duration:
   - For 30 minutes: 4 exercises
   - For 45 minutes: 6 exercises
   - For 60 minutes: 8 exercises

2. Each exercise should contain exactly 10 examples/words/points

3. Use specialized, industry-specific vocabulary related to the topic

4. Avoid generalities and overly simple vocabulary

5. Structure the worksheet logically and progressively (from simpler to more difficult exercises)

6. Include:
   - A brief introduction to the topic (max 100 words)
   - A list of exactly 10 key words/phrases related to the topic (with translation or definition)
   - A dialogue or text (150-200 words) using key vocabulary
   - Remaining exercises tailored to the given preferences and lesson time
   - A short final exercise to consolidate the material

7. All instructions should be clear and written in English

8. Teacher tips should be included with each exercise

9. All content must be in English only

The worksheet should be practical and ready for immediate use by a teacher in class, with minimal need for editing (<10% corrections).
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
            content: "You are an expert English language teacher specializing in creating professional, industry-specific worksheets. Your worksheets are always structured with clear sections, exercises designed in a logical progression, and include vocabulary and activities specific to the requested topic."
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

// This component will be used to capture the API key securely
export const ApiKeyForm = ({ onSubmit, apiKey, setApiKey }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
      <h3 className="font-bold mb-2">Set OpenAI API Key</h3>
      <p className="text-sm text-gray-600 mb-3">
        Your API key is required to generate high-quality worksheets. It is only stored temporarily in your browser's memory.
      </p>
      
      <div className="flex gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={onSubmit}
          className="bg-edu-primary text-white px-4 py-2 rounded-md hover:bg-edu-dark"
        >
          Set Key
        </button>
      </div>
    </div>
  );
};
