
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Clock } from 'lucide-react';

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
      <div className="bg-amber-50 p-4 border-l-4 border-amber-400 text-amber-800 mb-4 flex items-start">
        <div className="p-2 bg-amber-100 rounded-full mr-3">
          <Edit size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-medium">Editing Mode</p>
          <p className="text-sm">Make your changes and click "Save Changes" when done. All modifications will be included in the downloaded PDF.</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
        />
      </div>
      
      <h3 className="font-bold text-lg flex items-center">
        <span className="mr-2">Exercises</span>
        <span className="text-xs bg-edu-primary text-white px-2 py-1 rounded-full">{exercises.length}</span>
      </h3>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={exercise.title}
                onChange={(e) => onExerciseChange(index, 'title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="ml-2 flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <Clock size={14} className="mr-1" />
              <span className="text-xs font-medium">{exercise.duration || 10} min</span>
            </div>
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
                Teacher Tips <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Only visible in Teacher view</span>
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
