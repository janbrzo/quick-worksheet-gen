
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Clock, Pencil, Save } from 'lucide-react';

interface WorksheetEditorProps {
  content: string;
  exercises: Exercise[];
  viewMode: WorksheetView;
  onContentChange: (content: string) => void;
  onExerciseChange: (index: number, field: keyof Exercise, value: string) => void;
  subtitle?: string;
  introduction?: string;
  onSubtitleChange?: (subtitle: string) => void;
  onIntroductionChange?: (introduction: string) => void;
}

const WorksheetEditor: React.FC<WorksheetEditorProps> = ({ 
  content, 
  exercises, 
  viewMode,
  onContentChange,
  onExerciseChange,
  subtitle,
  introduction,
  onSubtitleChange,
  onIntroductionChange
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 border-l-4 border-amber-400 text-amber-800 mb-4 flex items-start rounded-md shadow-sm">
        <div className="p-2 bg-amber-100 rounded-full mr-3">
          <Edit size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-medium">Editing Mode</p>
          <p className="text-sm">Make your changes and click "Save Changes" when done. All modifications will be included in the downloaded PDF.</p>
        </div>
      </div>
      
      {/* Subtitle and Introduction section (if available) */}
      {(subtitle !== undefined || introduction !== undefined) && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-amber-300 focus-within:border-amber-400 transition-colors space-y-4">
          {subtitle !== undefined && onSubtitleChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <input 
                type="text"
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300"
              />
            </div>
          )}
          
          {introduction !== undefined && onIntroductionChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Introduction <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <Textarea 
                value={introduction}
                onChange={(e) => onIntroductionChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] focus:border-amber-400 focus:ring-amber-300"
              />
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-amber-300 focus-within:border-amber-400 transition-colors">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overview <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
        </label>
        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">Exercises</span>
          <span className="text-xs bg-edu-primary text-white px-2 py-1 rounded-full">{exercises.length}</span>
        </h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Pencil size={16} /> Click on any field below to edit
        </div>
      </div>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <input
                type="text"
                value={exercise.title}
                onChange={(e) => onExerciseChange(index, 'title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300 bg-amber-50/30"
              />
            </div>
            <div className="ml-2 flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded">
              <Clock size={14} className="mr-1" />
              <span className="text-xs font-medium">{exercise.duration || exercise.time || 10} min</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
            </label>
            <input
              type="text"
              value={exercise.instructions}
              onChange={(e) => onExerciseChange(index, 'instructions', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300 bg-amber-50/30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
            </label>
            <Textarea
              value={exercise.content}
              onChange={(e) => onExerciseChange(index, 'content', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300 bg-amber-50/30"
            />
          </div>
          
          {viewMode === WorksheetView.TEACHER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Teacher Tips</span> 
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Only visible in Teacher view</span>
                <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <Textarea
                value={exercise.teacherAnswers || exercise.teacher_tip || ''}
                onChange={(e) => onExerciseChange(index, 'teacherAnswers', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300 bg-amber-50/30"
              />
            </div>
          )}
        </div>
      ))}
      
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors">
          <Save size={16} />
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default WorksheetEditor;
