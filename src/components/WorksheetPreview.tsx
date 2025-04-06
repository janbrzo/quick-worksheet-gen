
import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, Star, Edit, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import WorksheetContent from './worksheet/WorksheetContent';
import WorksheetEditor from './worksheet/WorksheetEditor';

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

  // Function to download worksheets
  const downloadWorksheet = async () => {
    try {
      if (!studentContentRef.current && !teacherContentRef.current) {
        toast.error("Could not find content to download");
        return;
      }
      
      // Display processing message
      toast.success('Your worksheets are being prepared for download');
      
      // Create a proper filename based on view mode
      const baseFilename = `worksheet-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
      
      // Import required libraries
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;
      
      // Download student view first
      if (studentContentRef.current) {
        const studentCanvas = await html2canvas(studentContentRef.current, {
          scale: 1.5,
          useCORS: true,
          logging: false,
          windowWidth: 1100,
          windowHeight: 1600,
          allowTaint: true
        });
        
        const studentPdf = new jsPDF('p', 'mm', 'a4');
        const imgData = studentCanvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = studentCanvas.height * imgWidth / studentCanvas.width;
        const pageHeight = 295; // A4 height in mm
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // First page
        studentPdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Additional pages if needed
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          studentPdf.addPage();
          studentPdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        studentPdf.save(`${baseFilename}-student.pdf`);
      }
      
      // Wait a bit before processing teacher view to avoid browser issues
      setTimeout(async () => {
        // Download teacher view if it exists and if we're in teacher mode
        if (teacherContentRef.current) {
          const teacherCanvas = await html2canvas(teacherContentRef.current, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            windowWidth: 1100,
            windowHeight: 1600,
            allowTaint: true
          });
          
          const teacherPdf = new jsPDF('p', 'mm', 'a4');
          const imgData = teacherCanvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const imgHeight = teacherCanvas.height * imgWidth / teacherCanvas.width;
          const pageHeight = 295; // A4 height in mm
          
          let heightLeft = imgHeight;
          let position = 0;
          
          // First page
          teacherPdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          
          // Additional pages if needed
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            teacherPdf.addPage();
            teacherPdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          
          teacherPdf.save(`${baseFilename}-teacher.pdf`);
        }
        
        toast.success('Worksheets downloaded successfully!');
      }, 1500);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Error downloading worksheet. Please try again.");
    }
  };
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4 text-edu-dark">Lesson Brief</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
              <span className="font-bold text-edu-primary block mb-1">Duration:</span> 
              <span className="text-edu-dark text-lg">{data.lessonDuration || "45"} minutes</span>
            </div>
            
            <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
              <span className="font-bold text-edu-primary block mb-1">Topic:</span> 
              <span className="text-edu-dark text-lg">{data.title.replace('Worksheet: ', '')}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
              <span className="font-bold text-edu-primary block mb-1">Activities:</span> 
              <span className="text-edu-dark text-lg">{data.exercises.length} exercises</span>
            </div>
            
            <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
              <span className="font-bold text-edu-primary block mb-1">Vocabulary:</span> 
              <span className="text-edu-dark text-lg">{data.vocabulary?.length || 0} terms</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-3 border-t border-gray-200 bg-edu-light bg-opacity-30 p-4 rounded-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm">
            <div className="p-2 rounded-full bg-edu-primary bg-opacity-20">
              <span className="text-edu-primary font-medium text-lg">{data.generationTime || 46}</span>
            </div>
            <span className="text-edu-dark">seconds to generate</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow-sm">
            <div className="p-2 rounded-full bg-edu-primary bg-opacity-20">
              <span className="text-edu-primary font-medium text-lg">{data.sourceCount || 55}</span>
            </div>
            <span className="text-edu-dark">sources used</span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-gray-50 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setWorksheetView(WorksheetView.STUDENT)}
              className={`px-4 py-2 text-sm font-medium border border-r-0 rounded-l-lg focus:z-10 focus:outline-none ${
                viewMode === WorksheetView.STUDENT 
                  ? 'bg-edu-primary text-white border-edu-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
              }`}
            >
              Student View
            </button>
            <button
              onClick={() => setWorksheetView(WorksheetView.TEACHER)}
              className={`px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:outline-none ${
                viewMode === WorksheetView.TEACHER 
                  ? 'bg-edu-primary text-white border-edu-primary' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
              }`}
            >
              Teacher View
            </button>
          </div>
          
          <div className="flex items-center bg-yellow-50 p-2 rounded-lg border border-yellow-200 text-yellow-700 text-sm">
            <Info size={16} className="mr-2" />
            <span>You can edit worksheet content by clicking the Edit button</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
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
              onClick={paymentComplete ? downloadWorksheet : onDownload}
              className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        <div ref={viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef} className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6">
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
