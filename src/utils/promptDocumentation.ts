
/**
 * Worksheet Generation Prompt Documentation
 * 
 * This file documents how the application generates worksheets using OpenAI.
 * 
 * CONNECTION STATUS:
 * Currently, the application has basic OpenAI integration but requires 
 * providing your own API key in the session for full functionality.
 * 
 * HOW TO USE:
 * 1. Enter your OpenAI API key (stored in session storage)
 * 2. Complete the worksheet form
 * 3. Click generate
 * 
 * PROMPT STRUCTURE:
 * The prompt to OpenAI follows this pattern:
 */

export const samplePrompt = `
Create an English language teaching worksheet about: {TOPIC} 
with the objective of: {OBJECTIVE}
for a {DURATION}-minute lesson.

Student preferences: {PREFERENCES}
Student profile: {PROFILE}
Additional information: {ADDITIONAL_INFO}

Please format the worksheet as follows:

# Title

## Overview
[A brief introduction to the lesson topic and objectives]

## Exercises
1. [Exercise title]
   Instructions: [Clear instructions with time estimates]
   Content: [Exercise content]
   Teacher Tips: [Notes for the teacher, only shown in teacher view]

2. [Exercise title]
   Instructions: [Clear instructions with time estimates]
   Content: [Exercise content]
   Teacher Tips: [Notes for the teacher, only shown in teacher view]

[Additional exercises as needed]

## Vocabulary
[List of key vocabulary terms with definitions and examples]
`;

/**
 * CURRENT IMPLEMENTATION:
 * 
 * In the current version, worksheet generation is handled in two ways:
 * 
 * 1. API-based generation:
 *    - If an OpenAI API key is provided, we attempt to use the OpenAI API to generate content
 *    - This happens in src/utils/openai.ts with the generateWorksheetWithAI function
 * 
 * 2. Fallback mock generation:
 *    - If no API key is provided or the API call fails, we use predefined templates
 *    - The fallback generation is handled in the useWorksheetGenerator hook
 * 
 * The mocked data includes:
 * - Template-based worksheet content
 * - Predefined exercises with different types (vocabulary, reading, etc.)
 * - Vocabulary lists
 * - Teacher notes
 */

export const openAIModels = {
  recommended: "gpt-3.5-turbo",
  alternative: "gpt-4",
  temperature: 0.7,
  maxTokens: 2000
};

/**
 * TO INTEGRATE YOUR OWN API KEY:
 * 
 * The application allows storing your OpenAI API key in session storage
 * for the duration of your session. This key is never sent to our servers
 * and is only used client-side to make direct API calls to OpenAI.
 * 
 * When the generateWorksheet function is called, it:
 * 1. Checks for a stored API key
 * 2. If present, makes a call to OpenAI using your key
 * 3. If not present or if the call fails, falls back to template generation
 */
