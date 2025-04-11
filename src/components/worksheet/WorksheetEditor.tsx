
import React, { useEffect, useRef } from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
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
  isEditing: boolean;
  onSaveChanges: () => void;
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
  isEditing,
  onSaveChanges
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Handle content changes by finding the edited element and updating state
  const handleEditableChange = (e: React.FormEvent<HTMLDivElement>, type: string, index?: number, field?: string) => {
    const target = e.target as HTMLDivElement;
    const newValue = target.innerText || '';
    
    if (type === 'content') {
      onContentChange(newValue);
    } else if (type === 'subtitle' && onSubtitleChange) {
      onSubtitleChange(newValue);
    } else if (type === 'introduction' && onIntroductionChange) {
      onIntroductionChange(newValue);
    } else if (type === 'exercise' && index !== undefined && field) {
      onExerciseChange(index, field as keyof Exercise, newValue);
    }
  };
  
  // Append event listeners to all editable elements
  useEffect(() => {
    if (isEditing && editorRef.current) {
      const editableElements = editorRef.current.querySelectorAll('.editable-content');
      
      editableElements.forEach(element => {
        element.setAttribute('contenteditable', 'true');
        element.classList.add('border', 'border-amber-200', 'focus:border-amber-400', 'focus:ring-2', 'focus:ring-amber-200', 'hover:bg-amber-50/30');
      });
    }
    
    return () => {
      if (editorRef.current) {
        const editableElements = editorRef.current.querySelectorAll('.editable-content');
        editableElements.forEach(element => {
          element.setAttribute('contenteditable', 'false');
          element.classList.remove('border', 'border-amber-200', 'focus:border-amber-400', 'focus:ring-2', 'focus:ring-amber-200', 'hover:bg-amber-50/30');
        });
      }
    };
  }, [isEditing]);
  
  return (
    <div ref={editorRef} className={isEditing ? 'editable-mode' : ''}>
      <div className="bg-amber-50 p-4 border-l-4 border-amber-400 text-amber-800 mb-4 flex items-start rounded-md shadow-sm">
        <div className="p-2 bg-amber-100 rounded-full mr-3">
          <Edit size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="font-medium">Editing Mode {isEditing ? 'Enabled' : 'Disabled'}</p>
          <p className="text-sm">{isEditing ? 'Click on any text to edit. Click "Save Changes" when done.' : 'Click "Edit Worksheet" to start editing the content.'}</p>
        </div>
      </div>
      
      {/* Subtitle and Introduction section */}
      {(subtitle !== undefined || introduction !== undefined) && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm focus-within:border-amber-400 transition-colors space-y-4 mb-6">
          {subtitle !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <div 
                className="editable-content w-full p-2 rounded-md bg-amber-50/30"
                onBlur={(e) => handleEditableChange(e, 'subtitle')}
                suppressContentEditableWarning={true}
              >
                {subtitle}
              </div>
            </div>
          )}
          
          {introduction !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Introduction <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <div 
                className="editable-content w-full p-3 rounded-md min-h-[100px] bg-amber-50/30"
                onBlur={(e) => handleEditableChange(e, 'introduction')}
                suppressContentEditableWarning={true}
              >
                {introduction}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm focus-within:border-amber-400 transition-colors mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overview <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>
        </label>
        <div
          className="editable-content w-full p-3 rounded-md min-h-[150px] bg-amber-50/30"
          onBlur={(e) => handleEditableChange(e, 'content')}
          suppressContentEditableWarning={true}
        >
          {content}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">Exercises</span>
          <span className="text-xs bg-edu-primary text-white px-2 py-1 rounded-full">{exercises.length}</span>
        </h3>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Pencil size={16} /> Click on any field below to edit
        </div>
      </div>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <div
                className="editable-content w-full p-2 rounded-md bg-amber-50/30"
                onBlur={(e) => handleEditableChange(e, 'exercise', index, 'title')}
                suppressContentEditableWarning={true}
              >
                {exercise.title}
              </div>
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
            <div
              className="editable-content w-full p-2 rounded-md bg-amber-50/30"
              onBlur={(e) => handleEditableChange(e, 'exercise', index, 'instructions')}
              suppressContentEditableWarning={true}
            >
              {exercise.instructions}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
            </label>
            <div
              className="editable-content w-full p-3 rounded-md min-h-[150px] bg-amber-50/30"
              onBlur={(e) => handleEditableChange(e, 'exercise', index, 'content')}
              suppressContentEditableWarning={true}
            >
              {exercise.content}
            </div>
          </div>
          
          {viewMode === WorksheetView.TEACHER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Teacher Tips</span> 
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Only visible in Teacher view</span>
                <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>
              </label>
              <div
                className="editable-content w-full p-3 rounded-md min-h-[150px] bg-amber-50/30"
                onBlur={(e) => handleEditableChange(e, 'exercise', index, 'teacherAnswers')}
                suppressContentEditableWarning={true}
              >
                {exercise.teacherAnswers || exercise.teacher_tip || ''}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isEditing && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={onSaveChanges}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-md transition-all transform hover:-translate-y-1"
          >
            <Save size={20} />
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default WorksheetEditor;
