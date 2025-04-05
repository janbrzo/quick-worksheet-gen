
import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, VocabularyItem, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, FileText, Star, Edit, Check, Book, FileCheck, CheckSquare, List } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorksheetPreviewProps {
  data: WorksheetData;
  viewMode: WorksheetView;
  onDownload: () => void;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ data, viewMode, onDownload }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);
  const [editableExercises, setEditableExercises] = useState<Exercise[]>(data.exercises);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ rating: 0, comment: '' });
  
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      toast.success('Changes saved successfully');
    }
    setIsEditing(!isEditing);
  };

  const handleEditExercise = (index: number, field: keyof Exercise, value: string) => {
    const updatedExercises = [...editableExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setEditableExercises(updatedExercises);
  };

  const handleRateWorksheet = (rating: number) => {
    setFeedbackData({ ...feedbackData, rating });
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = () => {
    toast.success(`Thank you for rating this worksheet ${feedbackData.rating}/5!`);
    setFeedbackDialogOpen(false);
    // Here you would typically send the feedback data to your backend
  };
  
  const renderExerciseContent = (exercise: Exercise, index: number) => {
    // Determine if we should show answers based on view mode
    const showAnswers = viewMode === WorksheetView.TEACHER && exercise.teacherAnswers;
    
    return (
      <div key={index} className={`my-6 pb-6 border-b border-gray-200 ${
        index % 2 === 0 ? 'bg-edu-light bg-opacity-20 p-4 rounded-lg' : ''
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-edu-primary text-white">
            {getExerciseIcon(exercise.type)}
          </div>
          <h3 className="font-bold text-lg text-edu-primary">{exercise.title}</h3>
        </div>
        
        <div className="italic mb-4 pl-2 border-l-4 border-edu-accent py-1">{exercise.instructions}</div>
        
        <div className={showAnswers ? 'mb-4' : ''}>
          {renderExerciseLayout(exercise)}
        </div>
        
        {viewMode === WorksheetView.TEACHER && (
          <div className="mt-4 bg-edu-light bg-opacity-40 p-3 rounded-lg border-l-4 border-edu-secondary">
            <div className="flex items-center gap-2 text-edu-secondary font-medium mb-2">
              <FileCheck size={18} />
              Teacher Tips
            </div>
            <div className="text-sm">
              {exercise.teacherAnswers ? renderMarkdown(exercise.teacherAnswers) : (
                <p>Focus on communication over accuracy. Encourage students to use the vocabulary from this section.</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const getExerciseIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'vocabulary':
        return <Book size={16} />;
      case 'reading':
        return <FileText size={16} />;
      case 'writing':
        return <Edit size={16} />;
      case 'grammar':
        return <CheckSquare size={16} />;
      case 'listening':
        return <List size={16} />;
      default:
        return <FileText size={16} />;
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
              <div key={i} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                <div className="font-bold text-edu-primary">{term}</div>
                <div className="text-sm mt-1">{definition}</div>
                <div className="text-xs text-gray-500 mt-1">Context: {context}</div>
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
        {title && <h4 className="font-medium mb-3">{title.replace('## ', '')}</h4>}
        <div className="space-y-3">
          {items.map((item, i) => {
            const content = item.replace(/^\d+\. /, '');
            
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-edu-primary text-white flex items-center justify-center text-sm font-medium">
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
        <div className="border-l-4 border-edu-primary pl-4 mb-4">
          {renderMarkdown(readingText)}
        </div>
        
        <h4 className="font-medium mb-3">Comprehension Questions</h4>
        <div className="space-y-2">
          {questions.split('\n')
            .filter(line => line.match(/^\d+\. /))
            .map((question, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-bold text-edu-primary">{i + 1}.</span>
                <div>{question.replace(/^\d+\. /, '')}</div>
              </div>
            ))}
        </div>
      </div>
    );
  };
  
  const renderVocabularySection = () => {
    // Group vocabulary items into columns
    const vocabItems = data.vocabulary || [];
    const itemsPerColumn = Math.ceil(vocabItems.length / 3);
    
    return (
      <div className="mt-8 pt-6 border-t-2 border-edu-primary">
        <h2 className="text-xl font-bold mb-4 text-edu-dark flex items-center gap-2">
          <Book size={20} />
          Vocabulary Reference Sheet
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          This vocabulary reference contains key terms used throughout the worksheet. Students can refer to it during exercises or use it for revision.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, colIndex) => (
            <div key={colIndex} className="space-y-3">
              {vocabItems
                .slice(colIndex * itemsPerColumn, (colIndex + 1) * itemsPerColumn)
                .map((item, i) => (
                  <div key={i} className="border-b border-gray-200 pb-2">
                    <div className="font-bold text-edu-primary">{item.term}</div>
                    <div className="text-sm">{item.definition}</div>
                    {item.example && viewMode === WorksheetView.TEACHER && (
                      <div className="text-xs text-gray-600 italic mt-1">Example: {item.example}</div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-edu-dark">{data.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditToggle}
            className="flex items-center gap-2"
          >
            {isEditing ? <><Check size={16} /> Save</> : <><Edit size={16} /> Edit</>}
          </Button>
          <Button 
            onClick={onDownload}
            className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
          >
            <Download size={16} />
            PDF
          </Button>
        </div>
      </div>

      <div ref={contentRef} className="print-content">
        <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6">
          {!isEditing ? (
            <div>
              <div className="mb-6">
                {renderMarkdown(editableContent)}
              </div>
              
              {editableExercises.map((exercise, index) => (
                renderExerciseContent(exercise, index)
              ))}
              
              {renderVocabularySection()}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                <Textarea 
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
                />
              </div>
              
              <h3 className="font-bold text-lg">Exercises</h3>
              
              {editableExercises.map((exercise, index) => (
                <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={exercise.title}
                      onChange={(e) => handleEditExercise(index, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={exercise.instructions}
                      onChange={(e) => handleEditExercise(index, 'instructions', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <Textarea
                      value={exercise.content}
                      onChange={(e) => handleEditExercise(index, 'content', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                    />
                  </div>
                  
                  {viewMode === WorksheetView.TEACHER && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher Notes (only visible in Teacher view)
                      </label>
                      <Textarea
                        value={exercise.teacherAnswers || ''}
                        onChange={(e) => handleEditExercise(index, 'teacherAnswers', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-gray-500 italic">
            This is a general worksheet created based on your input. 
            Provide more specific details to get more personalized materials tailored to your students.
          </p>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 mr-2">Rate this worksheet:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button 
                key={rating}
                onClick={() => handleRateWorksheet(rating)}
                className={`text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors ${
                  rating <= feedbackData.rating ? 'text-yellow-400' : ''
                }`}
              >
                <Star size={20} className="fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your feedback is important!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button 
                  key={rating}
                  onClick={() => setFeedbackData({ ...feedbackData, rating })}
                  className={`text-gray-400 mx-1 hover:text-yellow-400 focus:outline-none transition-colors ${
                    rating <= feedbackData.rating ? 'text-yellow-400' : ''
                  }`}
                >
                  <Star size={24} className="fill-current" />
                </button>
              ))}
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you think about this worksheet? (optional)
            </label>
            <Textarea
              value={feedbackData.comment}
              onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
              placeholder="Your feedback helps us improve our worksheet generator"
              className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorksheetPreview;
