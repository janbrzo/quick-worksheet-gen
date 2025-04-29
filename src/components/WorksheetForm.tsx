
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import TileSelector from './TileSelector';
import { FormData, GenerationStatus } from '@/types/worksheet';
import { ArrowRight, RefreshCw, Clock, Star, FileText, Settings } from 'lucide-react';

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
  const [randomizedStruggles, setRandomizedStruggles] = useState<string[]>([]);

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
    "Logistics: supply chain management",
    "Construction: safety protocols",
    "Real Estate: property valuation"
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
    "Developing skills for virtual meetings",
    "Speaking fluently under pressure",
    "Expanding industry-specific vocabulary",
    "Preparing for a presentation",
    "Preparing for customer-facing roles",
    "Practicing listening comprehension"
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
    "Listening exercises",
    "Paraphrasing",
    "Writing exercises",
    "Simulated meetings or interviews",
    "Reading comprehension activities",
    "Gap-fill exercises"
  ];

  const allProfileTiles = [
    "Goal: promotion in IT job, prefers writing",
    "Goal: passing IELTS exam, prefers quizzes",
    "Goal: business conversations, prefers dialogues",
    "Goal: work presentation, prefers discussions",
    "Goal: conversational fluency, prefers role-play",
    "Goal: IT career advancement, prefers writing, interested in technology",
    "Goal: medical communication, hands-on learner, healthcare background",
    "Goal: legal correspondence, detail-oriented, law background",
    "Goal: academic presentations, analytical thinker, research background",
    "Goal: passing IELTS exam, prefers quizzes, interested in travel"
  ];
  
  const allStrugglesTiles = [
    "Student struggles with 'r' pronunciation",
    "Student gets nervous during role-plays, needs encouragement",
    "Student prefers visual learning materials",
    "Student is a quick learner but gets impatient with repetitive exercises",
    "Student frequently travels internationally and needs practical travel English"
  ];

  useEffect(() => {
    // Randomize the tiles on component mount
    setRandomizedTopics(getRandomItems(allTopicTiles, 5));
    setRandomizedObjectives(getRandomItems(allObjectiveTiles, 5));
    setRandomizedPreferences(getRandomItems(allPreferencesTiles, 5));
    setRandomizedProfiles(getRandomItems(allProfileTiles, 5));
    setRandomizedStruggles(getRandomItems(allStrugglesTiles, 5));
  }, []);

  // Function to get random items from an array
  const getRandomItems = (array: string[], count: number): string[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* Sidebar */}
      <div className="worksheet-sidebar">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-text mb-2">English Worksheet Generator</h1>
          <p className="text-gray-600 text-sm">Create professional worksheets in less than 5 minutes</p>
        </div>
        
        <div className="space-y-8">
          <div className="worksheet-sidebar-feature">
            <div className="worksheet-sidebar-icon">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Save Time</h3>
              <p className="text-sm text-gray-600">Create in 5 minutes what would normally take 1-2 hours</p>
            </div>
          </div>
          
          <div className="worksheet-sidebar-feature">
            <div className="worksheet-sidebar-icon">
              <Star size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Tailored Content</h3>
              <p className="text-sm text-gray-600">Specific, industry-focused exercises for your students</p>
            </div>
          </div>
          
          <div className="worksheet-sidebar-feature">
            <div className="worksheet-sidebar-icon">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Ready to Use</h3>
              <p className="text-sm text-gray-600">Minimal edits needed (less than 10%)</p>
            </div>
          </div>
          
          <div className="worksheet-sidebar-feature">
            <div className="worksheet-sidebar-icon">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Customizable</h3>
              <p className="text-sm text-gray-600">Easy to edit and adapt to your needs</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form */}
      <div className="worksheet-form-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h2 className="text-3xl font-bold text-purple-text">
            Create Your Worksheet
          </h2>
          
          <div className="flex gap-2">
            {['30', '45', '60'].map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => updateField('lessonDuration', duration)}
                className={`worksheet-duration-tab ${
                  formData.lessonDuration === duration
                    ? 'worksheet-duration-tab-active'
                    : 'worksheet-duration-tab-inactive'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div>
            <TileSelector
              label="Lesson topic: What is the main subject of the lesson?"
              placeholder="E.g., IT: debugging code, Business: negotiations"
              tiles={randomizedTopics}
              value={formData.lessonTopic}
              onChange={(value) => updateField('lessonTopic', value)}
            />
          </div>

          <div>
            <TileSelector
              label="Lesson goal: What would you like to focus on during this lesson?"
              placeholder="E.g., Preparing for a presentation, Practicing vocabulary"
              tiles={randomizedObjectives}
              value={formData.lessonObjective}
              onChange={(value) => updateField('lessonObjective', value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <TileSelector
              label="Teaching preferences: What stimulates your student best?"
              placeholder="E.g., Writing exercises, Dialogues"
              tiles={randomizedPreferences}
              value={formData.preferences}
              onChange={(value) => updateField('preferences', value)}
            />
          </div>

          <div>
            <TileSelector
              label="Student Profile (optional)"
              placeholder="E.g., Goal: promotion in IT job, prefers writing..."
              tiles={randomizedProfiles}
              value={formData.studentProfile || ''}
              onChange={(value) => updateField('studentProfile', value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <TileSelector
              label="Main Struggles: What does your student struggle with during lessons?"
              placeholder="E.g., Student struggles with 'r' pronunciation"
              tiles={randomizedStruggles}
              value={formData.additionalInfo || ''}
              onChange={(value) => updateField('additionalInfo', value)}
            />
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-8">
          {isCompleted && (
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex items-center gap-2 px-6"
            >
              <RefreshCw size={20} />
              Start Over
            </Button>
          )}
          <Button
            onClick={generateWorksheet}
            disabled={isGenerating || !formData.lessonTopic || !formData.lessonObjective || !formData.preferences}
            className="bg-purple-main hover:bg-purple-hover text-white flex items-center gap-2 px-8 py-6 text-lg rounded-lg shadow-sm transition-all"
          >
            {isGenerating ? 'Generating...' : isCompleted ? 'Generate Again' : 'Generate Custom Worksheet'}
            {!isGenerating && <ArrowRight size={20} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorksheetForm;
