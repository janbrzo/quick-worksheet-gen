
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Textarea } from '@/components/ui/textarea';

interface WorksheetEditorProps {
  content: string;
  exercises: Exercise[];
  viewMode: WorksheetView;
  onContentChange: (content: string) => void;
  onExerciseChange: (index: number, field: keyof Exercise, value: string) => void;
}

const WorksheetEditor: React.FC<WorksheetEditorProps> = ({ 
  content, 
  exercises, 
  viewMode,
  onContentChange,
  onExerciseChange
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-3 border-l-4 border-yellow-400 text-yellow-800 mb-4">
        <p className="font-medium">Editing Mode</p>
        <p className="text-sm">Make your changes and click "Save Changes" when done.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
        />
      </div>
      
      <h3 className="font-bold text-lg">Exercises</h3>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={exercise.title}
              onChange={(e) => onExerciseChange(index, 'title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <input
              type="text"
              value={exercise.instructions}
              onChange={(e) => onExerciseChange(index, 'instructions', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <Textarea
              value={exercise.content}
              onChange={(e) => onExerciseChange(index, 'content', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
            />
          </div>
          
          {viewMode === WorksheetView.TEACHER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher Tips (only visible in Teacher view)
              </label>
              <Textarea
                value={exercise.teacherAnswers || ''}
                onChange={(e) => onExerciseChange(index, 'teacherAnswers', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorksheetEditor;
