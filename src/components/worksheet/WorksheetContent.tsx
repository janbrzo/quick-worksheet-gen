
import React from 'react';
import { Exercise, VocabularyItem, WorksheetView } from '@/types/worksheet';
import { 
  BookOpen, 
  Link, 
  PenTool, 
  MessageCircle, 
  CheckSquare, 
  MessageSquare,
  Clock
} from 'lucide-react';

interface WorksheetContentProps {
  content: string;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  viewMode: WorksheetView;
  isEditing: boolean;
  isExportMode?: boolean;
  subtitle?: string;
  introduction?: string;
}

const WorksheetContent: React.FC<WorksheetContentProps> = ({ 
  content, 
  exercises, 
  vocabulary, 
  viewMode,
  isEditing,
  isExportMode = false,
  subtitle,
  introduction
}) => {
  // Helper function to get the appropriate icon for exercise type
  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <BookOpen size={18} />;
      case 'vocabulary':
      case 'matching':
        return <Link size={18} />;
      case 'writing':
      case 'fill-in-blanks':
        return <PenTool size={18} />;
      case 'speaking':
      case 'dialogue':
        return <MessageCircle size={18} />;
      case 'grammar':
      case 'multiple-choice':
        return <CheckSquare size={18} />;
      case 'discussion':
        return <MessageSquare size={18} />;
      default:
        return <BookOpen size={18} />;
    }
  };

  // Helper function to render content with proper HTML formatting
  const renderHTML = (html: string) => {
    return { __html: html };
  };
  
  // Filter out interactive quiz exercises
  const filteredExercises = exercises.filter(exercise => 
    !(exercise.type as string).includes('interactive-quiz') && 
    !(exercise.type as string).includes('quiz')
  );
  
  // Helper function to shuffle array
  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Helper to render different exercise types
  const renderExerciseContent = (exercise: Exercise) => {
    const { type } = exercise;
    
    switch (type) {
      case 'reading':
        return (
          <div>
            {exercise.content && (
              <div 
                className="bg-slate-50 p-4 rounded-lg mb-4 text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={renderHTML(exercise.content)}
              />
            )}
            {exercise.questions && (
              <ol className="list-decimal pl-5 space-y-2">
                {exercise.questions.map((question, idx) => (
                  <li key={idx} className="pl-1 py-1">
                    {question.text}
                    {viewMode === WorksheetView.TEACHER && question.answer && (
                      <span className="ml-2 text-emerald-600 font-medium">
                        Answer: {question.answer}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      
      case 'matching':
      case 'vocabulary':
        {
          // Always create a copy of the items to avoid modifying the original
          const items = [...(exercise.items || [])];
          
          // Create terms array (always in original order for the left column)
          const terms = items.map(item => ({ term: item.term }));
          
          // Always randomize the definitions for both student and teacher view
          const shuffledDefinitions = shuffleArray(items.map(item => ({ 
            definition: item.definition, 
            originalIndex: items.findIndex(d => d.definition === item.definition),
            term: item.term // Keep track of which term this definition belongs to
          })));
          
          // Generate letter labels
          const letterLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
          
          return (
            <div className="grid grid-cols-4 gap-4">
              {/* Left column: Terms (narrower) */}
              <div className="col-span-1 space-y-3">
                <div className="bg-indigo-50 px-3 py-2 rounded-md font-medium text-indigo-700 text-sm">
                  Terms
                </div>
                {terms.map((item, idx) => (
                  <div key={`term-${idx}`} className="flex items-center p-3 border border-gray-200 bg-slate-50 rounded-md">
                    <div className="font-semibold text-indigo-700">
                      {idx + 1}. {item.term}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Middle column: Answers (input field) */}
              <div className="col-span-1 space-y-3">
                <div className="bg-indigo-50 px-3 py-2 rounded-md font-medium text-indigo-700 text-sm">
                  Answers
                </div>
                {terms.map((item, idx) => {
                  // Find the correct definition for this term
                  const correctDefinitionIndex = shuffledDefinitions.findIndex(d => d.term === item.term);
                  // Get the correct letter
                  const correctLetter = letterLabels[correctDefinitionIndex];
                  
                  return (
                    <div key={`answer-${idx}`} className="flex items-center p-3 border border-gray-200 bg-slate-50 rounded-md">
                      {viewMode === WorksheetView.TEACHER ? (
                        <div className="font-semibold text-emerald-600 text-center w-full">
                          {correctLetter}
                        </div>
                      ) : (
                        <div className="font-semibold text-gray-300 text-center w-full">
                          {isExportMode ? "____" : "_____"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Right column: Definitions (spanning 2 columns) */}
              <div className="col-span-2 space-y-3">
                <div className="bg-indigo-50 px-3 py-2 rounded-md font-medium text-indigo-700 text-sm">
                  Definitions
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {shuffledDefinitions.map((definition, idx) => (
                    <div key={`def-${idx}`} className="flex items-center p-3 border border-gray-200 bg-slate-50 rounded-md">
                      <div className="text-gray-700">
                        <span className="font-bold mr-2 text-indigo-700">{letterLabels[idx]}.</span> {definition.definition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
      
      case 'fill-in-blanks':
        {
          // Always randomize word bank order for both views
          const randomizedWordBank = exercise.word_bank 
            ? shuffleArray([...exercise.word_bank]) 
            : exercise.word_bank;
          
          // Always randomize sentences for both views
          const randomizedSentences = exercise.sentences 
            ? shuffleArray([...exercise.sentences]) 
            : exercise.sentences;
            
          return (
            <div>
              {randomizedWordBank && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-100 rounded-lg">
                  {randomizedWordBank.map((word, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-indigo-700">
                      {word}
                    </span>
                  ))}
                </div>
              )}
              
              {randomizedSentences && (
                <ol className="list-decimal pl-5 space-y-3">
                  {randomizedSentences.map((sentence, idx) => (
                    <li key={idx} className="pl-1">
                      <span dangerouslySetInnerHTML={renderHTML(sentence.text)} />
                      {viewMode === WorksheetView.TEACHER && sentence.answer && (
                        <span className="ml-2 text-emerald-600 font-medium">
                          Answer: {sentence.answer}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        }
      
      case 'multiple-choice':
        return (
          <div className="space-y-6">
            {exercise.questions && exercise.questions.map((question, qIdx) => (
              <div key={qIdx} className="mb-4">
                <p className="font-medium mb-2">{qIdx + 1}. {question.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                  {question.options && question.options.map((option, oIdx) => (
                    <div 
                      key={oIdx} 
                      className={`p-2 border rounded-md flex items-center gap-2 ${option.correct && viewMode === WorksheetView.TEACHER ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}
                    >
                      {isExportMode ? (
                        <div className={`w-5 h-5 flex-shrink-0 rounded border text-center leading-5 ${option.correct && viewMode === WorksheetView.TEACHER ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : 'border-gray-400'}`}>
                          {option.correct && viewMode === WorksheetView.TEACHER ? "✓" : option.label}
                        </div>
                      ) : (
                        <div className={`w-5 h-5 flex-shrink-0 rounded border ${option.correct && viewMode === WorksheetView.TEACHER ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : 'border-gray-400'} flex items-center justify-center text-xs`}>
                          {option.correct && viewMode === WorksheetView.TEACHER ? "✓" : option.label}
                        </div>
                      )}
                      <span className="text-sm">{option.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'dialogue':
        return (
          <div>
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              {exercise.dialogue && exercise.dialogue.map((line, idx) => (
                <p key={idx} className="mb-2">
                  <span className="font-semibold text-indigo-700">{line.speaker}:</span> {line.text}
                </p>
              ))}
            </div>
            
            {exercise.expressions && (
              <div>
                <p className="font-medium my-3">{exercise.expression_instruction || "Practice using these expressions:"}</p>
                <div className="flex flex-wrap gap-2">
                  {exercise.expressions.map((expression, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 border border-gray-200 rounded-md">
                      {expression}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'discussion':
        return (
          <ul className="list-none space-y-2">
            {exercise.questions && exercise.questions.map((question, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold mt-1">→</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        );
      
      default:
        return (
          <div dangerouslySetInnerHTML={renderHTML(exercise.content)} />
        );
    }
  };

  return (
    <div className={`space-y-6 ${isExportMode ? 'export-mode' : ''}`}>
      {/* Introduction section */}
      {(subtitle || introduction) && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md mb-6">
          {subtitle && <h2 className="text-amber-800 font-medium mb-2">{subtitle}</h2>}
          {introduction && <p className="text-amber-700">{introduction}</p>}
        </div>
      )}
      
      {/* Only show main content if it's not already in the introduction */}
      {!introduction && content && (
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{content}</p>
        </div>
      )}
      
      {/* Exercises */}
      <div className="space-y-8">
        {filteredExercises.map((exercise, index) => (
          <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  {getExerciseIcon(exercise.type)}
                </div>
                <h3 className="font-bold">{exercise.title}</h3>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                <Clock size={14} />
                <span>{exercise.duration || exercise.time || 5} min</span>
              </div>
            </div>
            
            <div className="p-4">
              <p className="mb-4 font-medium text-gray-700">{exercise.instructions}</p>
              
              {/* Render different exercise content based on type */}
              {renderExerciseContent(exercise)}
              
              {/* Teacher view only content */}
              {viewMode === WorksheetView.TEACHER && (exercise.teacher_tip || exercise.teacherAnswers) && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
                  <h4 className="text-blue-800 font-medium flex items-center gap-2 mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 2a.5.5 0 0 1 .5.5v.5h1a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-1v.5a.5.5 0 0 1-1 0v-.5h-1a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5h1v-.5A.5.5 0 0 1 8 2Z"/>
                      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0ZM4 1h5v1.5a.5.5 0 0 0 .5.5H13v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"/>
                    </svg>
                    Teacher Tip
                  </h4>
                  <p className="text-blue-800 text-sm">{exercise.teacher_tip || exercise.teacherAnswers}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Vocabulary section */}
      {vocabulary && vocabulary.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h3 className="text-xl font-bold text-center text-indigo-700 mb-4">Vocabulary Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {vocabulary.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-indigo-300 transition-colors">
                <div className="font-semibold text-indigo-700 mb-1">{item.term}</div>
                <div className="text-gray-700 text-sm">{item.definition}</div>
                {item.example && (
                  <div className="text-gray-500 text-xs mt-1 italic">"{item.example}"</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksheetContent;
