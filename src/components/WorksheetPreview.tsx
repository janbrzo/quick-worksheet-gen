import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Star, Info } from 'lucide-react';
import { toast } from 'sonner';
import WorksheetContent from './worksheet/WorksheetContent';
import WorksheetEditor from './worksheet/WorksheetEditor';
import WorksheetHeader from './worksheet/WorksheetHeader';
import InputParametersPanel from './worksheet/InputParametersPanel';
import WorksheetToolbar from './worksheet/WorksheetToolbar';
import FeedbackDialog from './worksheet/FeedbackDialog';
import { generatePDF } from '@/utils/pdfGenerator';

interface WorksheetPreviewProps {
  data: WorksheetData;
  viewMode: WorksheetView;
  onDownload: () => void;
  setWorksheetView: (view: WorksheetView) => void;
  paymentComplete: boolean;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ 
  data, 
  viewMode, 
  onDownload, 
  setWorksheetView,
  paymentComplete
}) => {
  const studentContentRef = useRef<HTMLDivElement>(null);
  const teacherContentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);
  const [editableExercises, setEditableExercises] = useState<Exercise[]>(data.exercises);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ rating: 0, comment: '' });
  
  const handleEditToggle = () => {
    if (isEditing) {
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
  };

  const downloadWorksheet = async () => {
    await generatePDF(
      studentContentRef,
      teacherContentRef,
      viewMode,
      data
    );
  };

  return (
    <div>
      <WorksheetHeader data={data} />
      <InputParametersPanel data={data} />
      <WorksheetToolbar 
        viewMode={viewMode}
        setWorksheetView={setWorksheetView}
        isEditing={isEditing}
        handleEditToggle={handleEditToggle}
        handleDownloadWorksheet={downloadWorksheet}
      />

      {!isEditing && (
        <div className="bg-amber-50 border-l-4 border-amber-300 p-4 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                <span className="font-medium">Tip:</span> Click the "Edit" button in the toolbar above to customize this worksheet.
                You can modify the overview, instructions, and exercise content.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-edu-dark">{data.title}</h2>
        </div>

        <div 
          ref={viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef} 
          className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6"
          id="worksheet-content"
        >
          {!isEditing ? (
            <WorksheetContent 
              content={editableContent}
              exercises={editableExercises}
              vocabulary={data.vocabulary || []}
              viewMode={viewMode}
              isEditing={false}
            />
          ) : (
            <WorksheetEditor
              content={editableContent}
              exercises={editableExercises}
              viewMode={viewMode}
              onContentChange={setEditableContent}
              onExerciseChange={handleEditExercise}
            />
          )}
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
      </div>

      <FeedbackDialog 
        open={feedbackDialogOpen}
        setOpen={setFeedbackDialogOpen}
        feedbackData={feedbackData}
        setFeedbackData={setFeedbackData}
        onSubmit={submitFeedback}
      />
    </div>
  );
};

export default WorksheetPreview;
