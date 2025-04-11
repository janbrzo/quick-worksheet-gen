
import React from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Clock, Pencil, Save, Check } from 'lucide-react';

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
  isEditing: boolean;
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
  onIntroductionChange,
  isEditing
}) => {
  return (
    <div className="space-y-6">
      {/* Edit mode information banner */}
      <div className={`bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white mb-6 rounded-xl shadow-md ${isEditing ? '' : 'hidden'}`}>
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Edit size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-2">Editing Mode Activated</h3>
            <p className="text-white/90">You're now free to customize any part of this worksheet to better fit your needs. Click on any field below to edit the content, then click "Save Changes" when done.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="bg-white/20 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                <Check size={14} className="text-white" /> 
                <span>All changes will be included in the downloaded PDF</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                <Check size={14} className="text-white" /> 
                <span>Formatting with markdown is supported</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtitle and Introduction section (if available) */}
      {(subtitle !== undefined || introduction !== undefined) && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-amber-300 focus-within:border-amber-400 transition-colors space-y-4">
          {subtitle !== undefined && onSubtitleChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span>Subtitle</span>
                <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
              </label>
              <input 
                type="text"
                value={subtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
              />
            </div>
          )}
          
          {introduction !== undefined && onIntroductionChange && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span>Introduction</span>
                <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
              </label>
              <Textarea 
                value={introduction}
                onChange={(e) => onIntroductionChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
              />
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-amber-300 focus-within:border-amber-400 transition-colors">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <span>Overview</span>
          <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
        </label>
        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
        />
      </div>
      
      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg flex items-center text-indigo-700">
          <span className="mr-2">Exercises</span>
          <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">{exercises.length}</span>
        </h3>
        <div className="text-sm text-indigo-600 flex items-center gap-2">
          <Pencil size={16} /> 
          <span>All fields below are editable</span>
        </div>
      </div>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Title</span>
                <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
              </label>
              <input
                type="text"
                value={exercise.title}
                onChange={(e) => onExerciseChange(index, 'title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
              />
            </div>
            <div className="ml-2 flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded">
              <Clock size={14} className="mr-1" />
              <span className="text-xs font-medium">{exercise.duration || exercise.time || 10} min</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span>Instructions</span>
              <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
            </label>
            <input
              type="text"
              value={exercise.instructions}
              onChange={(e) => onExerciseChange(index, 'instructions', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <span>Content</span>
              <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
            </label>
            <Textarea
              value={exercise.content}
              onChange={(e) => onExerciseChange(index, 'content', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
            />
          </div>
          
          {viewMode === WorksheetView.TEACHER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Teacher Tips</span> 
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Only visible in Teacher view</span>
                <span className="ml-2 text-amber-600 text-xs font-normal px-2 py-0.5 bg-amber-50 rounded-full">Edit me</span>
              </label>
              <Textarea
                value={exercise.teacherAnswers || exercise.teacher_tip || ''}
                onChange={(e) => onExerciseChange(index, 'teacherAnswers', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md min-h-[150px] focus:border-amber-400 focus:ring-amber-300 focus:ring-2 bg-amber-50/30"
              />
            </div>
          )}
        </div>
      ))}
      
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-md transition-all hover:shadow-lg hover:from-amber-600 hover:to-amber-700">
          <Save size={18} />
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default WorksheetEditor;
