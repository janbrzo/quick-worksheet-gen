
import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, Star, Edit, Check, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import WorksheetContent from './worksheet/WorksheetContent';
import WorksheetEditor from './worksheet/WorksheetEditor';

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
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-white pb-3 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-edu-dark">{data.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={handleEditToggle}
            className={`flex items-center gap-2 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'border-edu-primary text-edu-primary hover:bg-edu-light'}`}
          >
            {isEditing ? <><Check size={16} /> Save Changes</> : <><Edit size={16} /> Edit Worksheet</>}
          </Button>
          <Button 
            onClick={onDownload}
            className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6" ref={contentRef}>
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
