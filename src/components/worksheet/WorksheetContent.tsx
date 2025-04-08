
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Book, FileText, Edit, CheckSquare, List, Lightbulb, Clock, MessageCircle, Sparkles } from 'lucide-react';

interface WorksheetContentProps {
  content: string;
  exercises: Exercise[];
  vocabulary: any[];
  viewMode: WorksheetView;
  isEditing: boolean;
}

const WorksheetContent: React.FC<WorksheetContentProps> = ({ content, exercises, vocabulary, viewMode, isEditing }) => {
  if (isEditing) {
    return null; // Editing UI is handled by the parent component
  }

  // Extract title and overview from content
  const contentLines = content.split('\n');
  const title = contentLines.find(line => line.startsWith('# '))?.replace('# ', '') || '';
  
  // Remove title from content for separate rendering
  const filteredContent = contentLines.filter(line => !line.startsWith('# ')).join('\n');

  return (
    <div>
      {/* Compact title and overview section */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-md border-l-4 border-edu-primary mb-6">
        <h1 className="text-xl font-bold text-edu-dark">{title}</h1>
        <div className="mt-3 text-edu-dark/80">
          {renderMarkdown(filteredContent)}
        </div>
      </div>
      
      {exercises.map((exercise, index) => (
        renderExerciseContent(exercise, index, viewMode)
      ))}
      
      {renderVocabularySection(vocabulary, viewMode)}
    </div>
  );
};

const renderMarkdown = (text: string) => {
  return text.split('\n').map((line, index) => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold my-5 text-edu-dark">{line.replace('# ', '')}</h1>;
    } else if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold my-4 text-edu-primary">{line.replace('## ', '')}</h2>;
    } else if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-bold my-3 text-edu-secondary">{line.replace('### ', '')}</h3>;
    } else if (line.startsWith('* ')) {
      return <li key={index} className="ml-6 my-1 list-disc">{line.replace('* ', '')}</li>;
    } else if (line.startsWith('- ')) {
      return <li key={index} className="ml-6 my-1 list-disc">{line.replace('- ', '')}</li>;
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || 
               line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') ||
               line.startsWith('7. ') || line.startsWith('8. ') || line.startsWith('9. ') ||
               line.startsWith('10. ')) {
      return <div key={index} className="ml-6 my-1">{line}</div>;
    } else if (line.trim() === '') {
      return <br key={index} />;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={index} className="font-bold my-2">{line.replace(/^\*\*|\*\*$/g, '')}</p>;
    } else {
      return <p key={index} className="my-2">{line}</p>;
    }
  });
};

const renderExerciseContent = (exercise: Exercise, index: number, viewMode: WorksheetView) => {
  // Determine if we should show answers based on view mode
  const showAnswers = viewMode === WorksheetView.TEACHER && exercise.teacherAnswers;
  
  // Different colors for different exercise types
  const exerciseColors = {
    reading: 'from-blue-500 to-blue-600',
    vocabulary: 'from-green-500 to-green-600',
    writing: 'from-purple-500 to-purple-600',
    grammar: 'from-amber-500 to-amber-600',
    listening: 'from-rose-500 to-rose-600',
    speaking: 'from-cyan-500 to-cyan-600',
    default: 'from-indigo-500 to-violet-600'
  };
  
  const exerciseColor = exerciseColors[exercise.type] || exerciseColors.default;
  
  return (
    <div key={index} className="my-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className={`bg-gradient-to-r ${exerciseColor} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-md">
              {getExerciseIcon(exercise.type)}
            </div>
            <h3 className="font-bold text-lg">{exercise.title}</h3>
          </div>
          
          {exercise.duration && (
            <div className="flex items-center text-white bg-white/20 px-3 py-1.5 rounded-full text-sm">
              <Clock size={14} className="mr-1" />
              <span className="font-medium">{exercise.duration} min</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <div className="italic mb-5 pl-3 border-l-4 border-gray-300 py-2 bg-gray-50 rounded-r-md">
          {exercise.instructions}
        </div>
        
        <div className={showAnswers ? 'mb-4' : ''}>
          {renderExerciseLayout(exercise)}
        </div>
        
        {viewMode === WorksheetView.TEACHER && exercise.teacherAnswers && (
          <div className="mt-5 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
              <Lightbulb size={18} />
              Teacher Tips
            </div>
            <div className="text-sm text-blue-900">
              {renderMarkdown(exercise.teacherAnswers)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getExerciseIcon = (type: Exercise['type']) => {
  switch (type) {
    case 'vocabulary':
      return <Book size={18} className="text-white" />;
    case 'reading':
      return <FileText size={18} className="text-white" />;
    case 'writing':
      return <Edit size={18} className="text-white" />;
    case 'grammar':
      return <CheckSquare size={18} className="text-white" />;
    case 'listening':
      return <List size={18} className="text-white" />;
    case 'speaking':
      return <MessageCircle size={18} className="text-white" />;
    default:
      return <Sparkles size={18} className="text-white" />;
  }
};

const renderExerciseLayout = (exercise: Exercise) => {
  switch (exercise.type) {
    case 'vocabulary':
      return renderVocabularyExercise(exercise.content);
    case 'grammar':
      return renderGrammarExercise(exercise.content);
    case 'reading':
      return renderReadingExercise(exercise.content);
    default:
      return renderMarkdown(exercise.content);
  }
};

const renderVocabularyExercise = (content: string) => {
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('## '));
  const items = lines.filter(line => line.match(/^\d+\. \*\*/));
  
  return (
    <div>
      {title && <h4 className="font-medium mb-3">{title.replace('## ', '')}</h4>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => {
          const matches = item.match(/^\d+\. \*\*(.+?)\*\* - (.+?) \(related to (.+?)\)/);
          if (!matches) return null;
          
          const [_, term, definition, context] = matches;
          
          return (
            <div key={i} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors hover:border-indigo-200 shadow-sm">
              <div className="font-bold text-indigo-600">{term}</div>
              <div className="text-sm mt-2">{definition}</div>
              <div className="text-xs text-gray-500 mt-2 italic">Context: {context}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const renderGrammarExercise = (content: string) => {
  const lines = content.split('\n');
  const title = lines.find(line => line.startsWith('## '));
  const items = lines.filter(line => line.match(/^\d+\. /));
  
  return (
    <div>
      {title && <h4 className="font-medium mb-4">{title.replace('## ', '')}</h4>}
      <div className="space-y-4">
        {items.map((item, i) => {
          const content = item.replace(/^\d+\. /, '');
          
          return (
            <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm font-medium">
                {i + 1}
              </span>
              <div className="flex-1 border-b border-dashed border-gray-300 pb-1">
                {content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const renderReadingExercise = (content: string) => {
  const sections = content.split('## Comprehension Questions');
  
  if (sections.length < 2) return renderMarkdown(content);
  
  const readingText = sections[0];
  const questions = sections[1];
  
  return (
    <div>
      <div className="bg-blue-50 p-5 mb-6 rounded-lg border-l-4 border-blue-400 leading-relaxed">
        {renderMarkdown(readingText)}
      </div>
      
      <h4 className="font-semibold text-lg mb-4 text-blue-700">Comprehension Questions</h4>
      <div className="space-y-3 pl-2">
        {questions.split('\n')
          .filter(line => line.match(/^\d+\. /))
          .map((question, i) => (
            <div key={i} className="flex gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
              <span className="font-bold text-blue-600 w-6 text-center">{i + 1}.</span>
              <div className="flex-1">{question.replace(/^\d+\. /, '')}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

const renderVocabularySection = (vocabItems: any[], viewMode: WorksheetView) => {
  // Group vocabulary items into columns
  const itemsPerColumn = Math.ceil(vocabItems.length / 3);
  
  return (
    <div className="mt-10 pt-6 border-t-2 border-edu-primary">
      <h2 className="text-xl font-bold mb-4 text-edu-dark flex items-center gap-2">
        <Book size={20} />
        Vocabulary Reference Sheet
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        This vocabulary reference contains key terms used throughout the worksheet. Students can refer to it during exercises or use it for revision.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-gradient-to-br from-gray-50 to-indigo-50 p-5 rounded-lg">
        {Array.from({ length: 3 }).map((_, colIndex) => (
          <div key={colIndex} className="space-y-4">
            {vocabItems
              .slice(colIndex * itemsPerColumn, (colIndex + 1) * itemsPerColumn)
              .map((item, i) => (
                <div key={i} className="border-b border-gray-200 pb-3 hover:bg-white hover:shadow-sm p-2 rounded-md transition-all">
                  <div className="font-bold text-indigo-600">{item.term}</div>
                  <div className="text-sm mt-1">{item.definition}</div>
                  {item.example && viewMode === WorksheetView.TEACHER && (
                    <div className="text-xs text-gray-600 italic mt-2 bg-gray-50 p-2 rounded">Example: {item.example}</div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorksheetContent;
