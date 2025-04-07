
import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData, WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, Star, Edit, Check, Info, Zap, Database } from 'lucide-react';
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

  // Function to download worksheets - now working without payment
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
      
      // Import required libraries
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;
      
      // Download current view (student or teacher)
      const contentRef = viewMode === WorksheetView.STUDENT ? studentContentRef : teacherContentRef;
      
      if (contentRef.current) {
        const canvas = await html2canvas(contentRef.current, {
          scale: 2.0, // Higher scale for better quality
          useCORS: true,
          logging: false,
          windowWidth: 1100,
          windowHeight: 1600,
          allowTaint: true
        });
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions with wider margins
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 20; // Increased margin in mm
        
        const contentWidth = pageWidth - (2 * margin);
        const contentHeight = (canvas.height * contentWidth) / canvas.width;
        
        // Calculate how many pages we need
        const pageCount = Math.ceil(contentHeight / (pageHeight - (2 * margin)));
        
        // Calculate scaling for better page breaks
        const scaleFactor = canvas.width / contentWidth;
        const fullHeight = canvas.height;
        const pageContentHeight = (pageHeight - (2 * margin)) * scaleFactor;
        
        // Process each page to avoid cutting text
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          // Find a good break point (try to avoid cutting in the middle of text)
          let y = i * pageContentHeight;
          
          // If not first page and not last page, try to find a better break point
          if (i > 0 && i < pageCount - 1) {
            // Look for a good spot to break (e.g., by increasing y slightly to find a gap)
            // This is approximate but helps avoid cutting text
            y -= 30; // Move up more to avoid cutting text
          }
          
          // Add the image to the PDF with adjusted margins
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin,
            contentWidth,
            contentHeight,
            undefined,
            'FAST',
            -y / scaleFactor
          );
        }
        
        // Save with correct view mode in filename
        const viewSuffix = viewMode === WorksheetView.STUDENT ? "student" : "teacher";
        pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
        
        // If we're in student view, also generate teacher view (and vice versa)
        setTimeout(() => {
          downloadOtherView();
        }, 1000);
      }
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Error downloading worksheet. Please try again.");
    }
  };
  
  // Function to download the other view
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
      
      // Create a proper filename
      const baseFilename = `worksheet-${data.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
      
      // Import required libraries
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      
      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;
      
      const canvas = await html2canvas(otherContentRef.current, {
        scale: 2.0,
        useCORS: true,
        logging: false,
        windowWidth: 1100,
        windowHeight: 1600,
        allowTaint: true
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions with wider margins
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20; // Increased margin in mm
      
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Calculate how many pages we need
      const pageCount = Math.ceil(contentHeight / (pageHeight - (2 * margin)));
      
      // Calculate scaling for better page breaks
      const scaleFactor = canvas.width / contentWidth;
      const fullHeight = canvas.height;
      const pageContentHeight = (pageHeight - (2 * margin)) * scaleFactor;
      
      // Process each page to avoid cutting text
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Find a good break point
        let y = i * pageContentHeight;
        
        // If not first page and not last page, try to find a better break point
        if (i > 0 && i < pageCount - 1) {
          y -= 30; // Move up more to avoid cutting text
        }
        
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          contentWidth,
          contentHeight,
          undefined,
          'FAST',
          -y / scaleFactor
        );
      }
      
      // Add vocabulary on a separate page at the end
      if (data.vocabulary && data.vocabulary.length > 0) {
        pdf.addPage();
        
        // Add vocabulary title
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text("Vocabulary Sheet", margin, margin + 10);
        
        // Add vocabulary items
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        let yPos = margin + 20;
        const lineHeight = 8;
        
        data.vocabulary.forEach((item, index) => {
          // Add a new page if needed
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            yPos = margin + 10;
          }
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${item.term}`, margin, yPos);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`- ${item.definition}`, margin + 30, yPos);
          
          yPos += lineHeight;
          
          // Add example on next line if it exists
          if (item.example) {
            if (yPos > pageHeight - margin) {
              pdf.addPage();
              yPos = margin + 10;
            }
            
            pdf.setFont('helvetica', 'italic');
            pdf.text(`  Example: ${item.example}`, margin, yPos);
            pdf.setFont('helvetica', 'normal');
            
            yPos += lineHeight + 2; // Extra spacing after example
          } else {
            yPos += 2; // Just a bit of extra spacing between items
          }
        });
      }
      
      // Save with correct view mode in filename
      const viewSuffix = otherView === WorksheetView.STUDENT ? "student" : "teacher";
      pdf.save(`${baseFilename}-${viewSuffix}.pdf`);
      
      toast.success('Both worksheets downloaded successfully!');
    } catch (err) {
      console.error("Download error for other view:", err);
    }
  };
  
  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Generated Worksheet</h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-md">
            <Zap size={16} /> Generated in 38 seconds
          </div>
          <div className="inline-flex items-center gap-1 bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-md">
            <Database size={16} /> Based on 69 sources
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
        <h2 className="text-xl font-bold mb-4 text-edu-dark">Your Input Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-3">
              <span className="font-bold text-edu-primary block mb-1">Lesson Duration:</span> 
              <span className="text-edu-dark">{data.lessonDuration} minutes</span>
            </div>
            
            <div className="mb-3">
              <span className="font-bold text-edu-primary block mb-1">Topic:</span> 
              <span className="text-edu-dark">{data.lessonTopic}</span>
            </div>
          </div>
          
          <div>
            <div className="mb-3">
              <span className="font-bold text-edu-primary block mb-1">Goal:</span> 
              <span className="text-edu-dark">{data.lessonObjective}</span>
            </div>
            
            <div className="mb-3">
              <span className="font-bold text-edu-primary block mb-1">Preferences:</span> 
              <span className="text-edu-dark">{data.preferences}</span>
            </div>
            
            {data.studentProfile && (
              <div className="mb-3">
                <span className="font-bold text-edu-primary block mb-1">Student Profile:</span> 
                <span className="text-edu-dark">{data.studentProfile}</span>
              </div>
            )}
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant={isEditing ? "default" : "outline"}
              onClick={handleEditToggle}
              className={`flex items-center gap-2 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'border-edu-primary text-edu-primary hover:bg-edu-light'}`}
              size="sm"
            >
              {isEditing ? <><Check size={16} /> Save</> : <><Edit size={16} /> Edit</>}
            </Button>
            <Button 
              onClick={downloadWorksheet}
              className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
              size="sm"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-edu-dark">{data.title}</h2>
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
