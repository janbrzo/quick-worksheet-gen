
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Textarea } from '@/components/ui/textarea';
import { Edit, AlertTriangle, Clock } from 'lucide-react';

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
      <div className="bg-yellow-50 p-4 border-l-4 border-yellow-400 text-yellow-800 mb-4 flex items-start">
        <div className="p-2 bg-yellow-100 rounded-full mr-3">
          <Edit size={20} className="text-yellow-600" />
        </div>
        <div>
          <p className="font-medium">Editing Mode</p>
          <p className="text-sm">Make your changes and click "Save Changes" when done. All modifications will be included in the downloaded PDF.</p>
        </div>
      </div>
      
      <div className="bg-orange-50 p-4 border border-orange-200 rounded-lg mb-4">
        <div className="flex items-start">
          <AlertTriangle size={24} className="text-orange-500 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-orange-800">Editing Tips</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-orange-700 space-y-1">
              <li>You can edit any content in this worksheet including text, exercises, and instructions</li>
              <li>Add time estimates to exercises using the format "Time: X minutes"</li>
              <li>Use bold and italics with markdown: <code>**bold**</code> and <code>*italic*</code></li>
              <li>Teacher notes are only visible in the Teacher View</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Overview</label>
          <div className="text-xs text-gray-500">This section appears at the top of your worksheet</div>
        </div>
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-edu-primary text-white flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-sm text-gray-500">Exercise {index + 1}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Add time estimate in content or instructions as "Time: X minutes"</span>
              <Clock size={16} className="text-gray-400" />
            </div>
          </div>
          
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
              placeholder="E.g.: Match the vocabulary items with their definitions. Time: 10 minutes"
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
