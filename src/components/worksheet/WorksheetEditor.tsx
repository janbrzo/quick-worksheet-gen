
import React, { useEffect, useRef } from 'react';
import { Exercise, WorksheetView } from '@/types/worksheet';
import { Edit, Clock, Save } from 'lucide-react';

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
  const handleContentChange = (target: HTMLElement, type: string, index?: number, field?: string) => {
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
  
  // Enable editing for all editable content elements
  useEffect(() => {
    if (!editorRef.current) return;
    
    const editableElements = editorRef.current.querySelectorAll('.editable-content');
    
    if (isEditing) {
      // Enable editing
      editableElements.forEach(element => {
        element.setAttribute('contenteditable', 'true');
        element.classList.add('editable-active');
        
        // Add blur event listener to capture changes
        element.addEventListener('blur', (e) => {
          const target = e.target as HTMLElement;
          const type = target.dataset.type || '';
          const index = target.dataset.index ? parseInt(target.dataset.index) : undefined;
          const field = target.dataset.field || '';
          
          handleContentChange(target, type, index, field);
        });
      });
      
      // Add class to parent for styling
      editorRef.current.classList.add('editable-mode');
    } else {
      // Disable editing
      editableElements.forEach(element => {
        element.setAttribute('contenteditable', 'false');
        element.classList.remove('editable-active');
        
        // Remove event listener
        element.removeEventListener('blur', () => {});
      });
      
      // Remove class from parent
      editorRef.current.classList.remove('editable-mode');
    }
    
    // Cleanup on unmount
    return () => {
      const editableElements = editorRef.current?.querySelectorAll('.editable-content');
      editableElements?.forEach(element => {
        element.removeEventListener('blur', () => {});
      });
    };
  }, [isEditing, onContentChange, onExerciseChange, onSubtitleChange, onIntroductionChange]);
  
  return (
    <div ref={editorRef} className={isEditing ? 'worksheet-edit-mode' : ''}>
      {isEditing ? (
        <div className="bg-amber-50 p-4 border-l-4 border-amber-400 text-amber-800 mb-6 flex items-start rounded-md shadow-sm">
          <div className="p-2 bg-amber-100 rounded-full mr-3 flex-shrink-0">
            <Edit size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium">Editing Mode Enabled</p>
            <p className="text-sm">Click on any highlighted content to edit. All changes will be automatically saved when you click "Save Changes".</p>
          </div>
        </div>
      ) : null}
      
      {/* Subtitle and Introduction section */}
      {(subtitle !== undefined || introduction !== undefined) && (
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm focus-within:border-amber-400 transition-colors space-y-4 mb-6">
          {subtitle !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle {isEditing && <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>}
              </label>
              <div 
                className={`editable-content w-full p-2 rounded-md ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
                data-type="subtitle"
                suppressContentEditableWarning={true}
              >
                {subtitle}
              </div>
            </div>
          )}
          
          {introduction !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Introduction {isEditing && <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>}
              </label>
              <div 
                className={`editable-content w-full p-3 rounded-md min-h-[100px] ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
                data-type="introduction"
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
          Overview {isEditing && <span className="ml-2 text-amber-600 text-xs font-normal">(Editable)</span>}
        </label>
        <div
          className={`editable-content w-full p-3 rounded-md min-h-[150px] ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
          data-type="content"
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
      </div>
      
      {exercises.map((exercise, index) => (
        <div key={index} className="space-y-4 p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title {isEditing && <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>}
              </label>
              <div
                className={`editable-content w-full p-2 rounded-md ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
                data-type="exercise"
                data-index={index}
                data-field="title"
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
              Instructions {isEditing && <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>}
            </label>
            <div
              className={`editable-content w-full p-2 rounded-md ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
              data-type="exercise"
              data-index={index}
              data-field="instructions"
              suppressContentEditableWarning={true}
            >
              {exercise.instructions}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content {isEditing && <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>}
            </label>
            <div
              className={`editable-content w-full p-3 rounded-md min-h-[150px] ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
              data-type="exercise"
              data-index={index}
              data-field="content"
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
                {isEditing && <span className="ml-1 text-amber-600 text-xs font-normal">(Editable)</span>}
              </label>
              <div
                className={`editable-content w-full p-3 rounded-md min-h-[150px] ${isEditing ? 'bg-amber-50/30 border border-dashed border-amber-300' : ''}`}
                data-type="exercise"
                data-index={index}
                data-field="teacherAnswers"
                suppressContentEditableWarning={true}
              >
                {exercise.teacherAnswers || exercise.teacher_tip || ''}
              </div>
            </div>
          )}
        </div>
      ))}
      
      {isEditing && (
        <div className="flex justify-center mt-6 mb-4">
          <button 
            onClick={onSaveChanges}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg shadow-md transition-all transform hover:-translate-y-1 text-lg font-bold"
          >
            <Save size={22} />
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default WorksheetEditor;
