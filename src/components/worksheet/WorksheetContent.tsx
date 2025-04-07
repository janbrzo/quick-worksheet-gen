
import React from 'react';
import { Exercise, VocabularyItem, WorksheetView } from '@/types/worksheet';
import { Info } from 'lucide-react';

interface WorksheetContentProps {
  content: string;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  viewMode: WorksheetView;
  isEditing: boolean;
}

const WorksheetContent: React.FC<WorksheetContentProps> = ({ 
  content, 
  exercises, 
  vocabulary,
  viewMode,
  isEditing
}) => {
  // Format the content using a simple Markdown-like parser
  const formatContent = (text: string) => {
    if (!text) return '';
    
    // Handle headers
    let formattedText = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-3">$1</h3>');
    
    // Handle bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle paragraphs - split by double newlines and wrap in p tags
    formattedText = formattedText.split(/\n\n+/).map(p => 
      `<p class="mb-3">${p.replace(/\n/g, '<br />')}</p>`
    ).join('');
    
    return formattedText;
  };
  
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
      </div>
      
      {/* Exercises */}
      <div className="space-y-8">
        {exercises.map((exercise, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">{exercise.title}</h3>
            <div className="mb-3 bg-gray-50 p-3 rounded-md border-l-4 border-edu-primary">
              <p className="text-gray-700"><strong>Instructions:</strong> {exercise.instructions}</p>
            </div>
            
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: formatContent(exercise.content) }} />
            
            {viewMode === WorksheetView.TEACHER && exercise.teacherAnswers && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                <div className="flex items-start">
                  <Info size={20} className="text-blue-600 mr-2 mt-1" />
                  <div>
                    <p className="font-medium text-blue-700 mb-1">Teacher Notes:</p>
                    <div dangerouslySetInnerHTML={{ __html: formatContent(exercise.teacherAnswers) }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Vocabulary Section */}
      {vocabulary && vocabulary.length > 0 && (
        <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-bold mb-4">Vocabulary List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vocabulary.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <p className="font-bold">{item.term}</p>
                <p className="text-gray-700">{item.definition}</p>
                {item.example && <p className="text-gray-600 italic mt-1">"{item.example}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksheetContent;
