import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import WorksheetContent from './worksheet/WorksheetContent';
import WorksheetEditor from './worksheet/WorksheetEditor';
import WorksheetHeader from './worksheet/WorksheetHeader';
import InputParametersPanel from './worksheet/InputParametersPanel';
import WorksheetToolbar from './worksheet/WorksheetToolbar';
import FeedbackSection from './worksheet/FeedbackSection';
import { generatePdf } from '@/utils/pdfGenerator';

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
  // Refs for PDF generation
  const studentContentRef = useRef<HTMLDivElement>(null);
  const teacherContentRef = useRef<HTMLDivElement>(null);
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);
  const [editableExercises, setEditableExercises] = useState<Exercise[]>(data.exercises);
  
  // State for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ rating: 0, comment: '' });
  
  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      toast.success('Changes saved successfully');
    }
    setIsEditing(!isEditing);
  };

  // Update exercise
  const handleEditExercise = (index: number, field: keyof Exercise, value: string) => {
    const updatedExercises = [...editableExercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setEditableExercises(updatedExercises);
  };

  // Handle worksheet rating
  const handleRateWorksheet = (rating: number) => {
    setFeedbackData({ ...feedbackData, rating });
    setFeedbackDialogOpen(true);
  };

  // Submit feedback
  const submitFeedback = () => {
    toast.success(`Thank you for rating this worksheet ${feedbackData.rating}/5!`);
    setFeedbackDialogOpen(false);
    // Here you would typically send the feedback data to your backend
  };

  // Download worksheet
  const downloadWorksheet = async () => {
    try {
      if (!studentContentRef.current && !teacherContentRef.current) {
        toast.error("Could not find content to download");
        return;
      }
      
      // Display processing message for specific view
      if (viewMode === WorksheetView.STUDENT) {
        toast.success('Your STUDENT worksheet is being prepared for download');
      } else {
        toast.success('Your TEACHER worksheet is being prepared for download');
      }
      
      // Create a proper filename based on view mode
      const baseFilename = `worksheet-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
      
      // Get current view content ref
      const contentRef = viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
      
      // Generate PDF for current view
      const filename = await generatePdf({
        title: data.title,
        contentRef,
        viewMode,
        vocabulary: data.vocabulary
      });
      
      if (filename) {
        // Also generate the other view
        setTimeout(() => {
          downloadOtherView();
        }, 1000);
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Error downloading worksheet. Please try again.");
    }
  };
  
  // Download the opposite view
  const downloadOtherView = async () => {
    try {
      // Determine which view to download (opposite of current view)
      const otherView = viewMode === WorksheetView.STUDENT ? WorksheetView.TEACHER : WorksheetView.STUDENT;
      const otherContentRef = otherView === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
      
      if (!otherContentRef.current) {
        return;
      }
      
      // Display processing message for other view
      const viewName = otherView === WorksheetView.STUDENT ? "STUDENT" : "TEACHER";
      toast.success(`Your ${viewName} worksheet is also being prepared for download`);
      
      // Generate PDF for other view
      const filename = await generatePdf({
        title: data.title,
        contentRef: otherContentRef,
        viewMode: otherView,
        vocabulary: data.vocabulary
      });
      
      if (filename) {
        toast.success('Both worksheets downloaded successfully!');
      }
    } catch (err) {
      console.error("Download error for other view:", err);
    }
  };
  
  return (
    <div>
      {/* Header with generation info */}
      <WorksheetHeader data={data} />

      {/* Input parameters panel */}
      <InputParametersPanel data={data} />

      {/* Toolbar for view mode and actions */}
      <WorksheetToolbar 
        viewMode={viewMode}
        setWorksheetView={setWorksheetView}
        isEditing={isEditing}
        handleEditToggle={handleEditToggle}
        downloadWorksheet={downloadWorksheet}
      />

      {/* Worksheet content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-edu-dark">{data.title}</h2>
        </div>

        <div 
          ref={viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef} 
          className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6"
        >
          {!isEditing ? (
            <WorksheetContent 
              content={editableContent}
              exercises={editableExercises}
              vocabulary={data.vocabulary || []}
              viewMode={viewMode}
              isEditing={false}
              subtitle={data.subtitle}
              introduction={data.introduction}
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

        {/* Feedback section */}
        <FeedbackSection 
          feedbackData={feedbackData}
          handleRateWorksheet={handleRateWorksheet}
        />
      </div>

      {/* Feedback dialog */}
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
