
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TileSelector from './TileSelector';
import { FormData, GenerationStatus } from '@/types/worksheet';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface WorksheetFormProps {
  formData: FormData;
  updateField: (field: keyof FormData, value: string) => void;
  generateWorksheet: () => void;
  resetForm: () => void;
  generationStatus: GenerationStatus;
}

const WorksheetForm: React.FC<WorksheetFormProps> = ({
  formData,
  updateField,
  generateWorksheet,
  resetForm,
  generationStatus
}) => {
  const isGenerating = generationStatus === GenerationStatus.GENERATING;
  const isCompleted = generationStatus === GenerationStatus.COMPLETED;

  // Randomize the display of example tiles
  const [randomizedTopics, setRandomizedTopics] = useState<string[]>([]);
  const [randomizedObjectives, setRandomizedObjectives] = useState<string[]>([]);
  const [randomizedPreferences, setRandomizedPreferences] = useState<string[]>([]);
  const [randomizedProfiles, setRandomizedProfiles] = useState<string[]>([]);

  const allTopicTiles = [
    "IT: debugging code",
    "Business: trade negotiations",
    "Medicine: describing symptoms",
    "Tourism: hotel reservations",
    "Finance: budget analysis",
    "Marketing: social media campaigns",
    "Engineering: project specifications",
    "Law: contract terminology",
    "Science: laboratory procedures",
    "Education: lesson planning",
    "Retail: customer service",
    "Healthcare: patient care",
    "Manufacturing: quality control",
    "Hospitality: guest relations",
    "Logistics: supply chain management"
  ];

  const allObjectiveTiles = [
    "Preparing for a work presentation about AI",
    "Practicing vocabulary for a job interview",
    "Learning to describe business processes",
    "Developing fluency in technology discussions",
    "Understanding grammar: conditional sentences",
    "Improving email writing skills",
    "Mastering small talk with colleagues",
    "Learning to give and receive feedback",
    "Practicing phone conversations",
    "Developing skills for virtual meetings"
  ];

  const allPreferencesTiles = [
    "Writing exercises",
    "Dialogues and role-play",
    "Interactive quizzes",
    "Group discussions",
    "Industry text analysis",
    "Vocabulary building activities",
    "Grammar exercises with industry examples",
    "Pronunciation practice",
    "Reading comprehension tasks",
    "Listening exercises"
  ];

  const allProfileTiles = [
    "Goal: promotion in IT job, prefers writing",
    "Goal: passing IELTS exam, prefers quizzes",
    "Goal: business conversations, prefers dialogues",
    "Goal: work presentation, prefers discussions",
    "Goal: conversational fluency, prefers role-play"
  ];

  useEffect(() => {
    // Randomize the tiles on component mount
    setRandomizedTopics(getRandomItems(allTopicTiles, 5));
    setRandomizedObjectives(getRandomItems(allObjectiveTiles, 5));
    setRandomizedPreferences(getRandomItems(allPreferencesTiles, 5));
    setRandomizedProfiles(getRandomItems(allProfileTiles, 5));
  }, []);

  // Function to get random items from an array
  const getRandomItems = (array: string[], count: number): string[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Create Your Worksheet
        </h2>
        
        <div className="flex gap-2">
          {['30', '45', '60'].map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => updateField('lessonDuration', duration)}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                formData.lessonDuration === duration
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              {duration} min
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TileSelector
          label="Lesson Topic*"
          placeholder="E.g., IT: debugging code, Business: negotiations"
          tiles={randomizedTopics}
          value={formData.lessonTopic}
          onChange={(value) => updateField('lessonTopic', value)}
        />

        <TileSelector
          label="Lesson Objective*"
          placeholder="E.g., Preparing for a presentation, Practicing vocabulary"
          tiles={randomizedObjectives}
          value={formData.lessonObjective}
          onChange={(value) => updateField('lessonObjective', value)}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TileSelector
          label="Teaching Preferences*"
          placeholder="E.g., Writing exercises, Dialogues"
          tiles={randomizedPreferences}
          value={formData.preferences}
          onChange={(value) => updateField('preferences', value)}
        />

        <TileSelector
          label="Student Profile (optional)"
          placeholder="E.g., Goal: promotion in IT job, prefers writing..."
          tiles={randomizedProfiles}
          value={formData.studentProfile || ''}
          onChange={(value) => updateField('studentProfile', value)}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Additional Information (optional)
        </label>
        <textarea
          value={formData.additionalInfo || ''}
          onChange={(e) => updateField('additionalInfo', e.target.value)}
          placeholder="E.g., Student has difficulty pronouncing 'r', Please include more IT examples"
          className="w-full p-4 border border-gray-200 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
        />
      </div>

      <div className="flex gap-4 justify-center pt-6">
        {isCompleted && (
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex items-center gap-2 px-8"
          >
            <RefreshCw size={20} />
            New Worksheet
          </Button>
        )}
        <Button
          onClick={generateWorksheet}
          disabled={isGenerating || !formData.lessonTopic || !formData.lessonObjective || !formData.preferences}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 px-8 py-6 text-lg rounded-lg shadow-md transition-all"
        >
          {isGenerating ? 'Generating...' : isCompleted ? 'Generate Again' : 'Generate Worksheet'}
          {!isGenerating && <ArrowRight size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default WorksheetForm;
