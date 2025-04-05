
import React, { useRef, useState } from 'react';
import { WorksheetData, Exercise, FeedbackData } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, FileText, Star, Edit, Check, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorksheetPreviewProps {
  data: WorksheetData;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(data.content);
  const [editableExercises, setEditableExercises] = useState<Exercise[]>(data.exercises);
  const [editableTeacherNotes, setEditableTeacherNotes] = useState(data.teacherNotes);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({ rating: 0, comment: '' });
  const [temporaryRating, setTemporaryRating] = useState(0);
  
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold my-5">{line.replace('# ', '')}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold my-4">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold my-3 text-edu-primary">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('* ')) {
        return <li key={index} className="ml-6 my-1 list-disc">{line.replace('* ', '')}</li>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 my-1 list-disc">{line.replace('- ', '')}</li>;
      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || 
                 line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') ||
                 line.startsWith('7. ') || line.startsWith('8. ') || line.startsWith('9. ') ||
                 line.startsWith('10. ')) {
        return <div key={index} className="ml-6 my-1">{line}</div>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold my-2">{line.replace(/^\*\*|\*\*$/g, '')}</p>;
      } else {
        return <p key={index} className="my-2">{line}</p>;
      }
    });
  };

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

  const handleDownloadPDF = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    toast.success('Your worksheet is being prepared for download as PDF');
    setTimeout(() => {
      toast.success('PDF download ready!');
    }, 2000);
  };

  const handlePrintWorksheet = () => {
    toast.success('Preparing worksheet for printing');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleRateWorksheet = (rating: number) => {
    setTemporaryRating(rating);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-edu-dark">{data.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleEditToggle}
            className="flex items-center gap-2"
          >
            {isEditing ? <><Check size={16} /> Save</> : <><Edit size={16} /> Edit</>}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePrintWorksheet}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
          >
            <Download size={16} />
            PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="worksheet" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="worksheet">Worksheet</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="worksheet">
          <div ref={contentRef} className="print-content">
            <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6">
              {!isEditing ? (
                <div>
                  {renderMarkdown(editableContent)}
                  
                  {editableExercises.map((exercise, index) => (
                    <div key={index} className="my-8 pb-6 border-b border-gray-200">
                      <h3 className="font-bold text-lg text-edu-primary mb-2">{exercise.title}</h3>
                      <p className="italic mb-4">{exercise.instructions}</p>
                      {renderMarkdown(exercise.content)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                    <Textarea 
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg">Exercises</h3>
                  
                  {editableExercises.map((exercise, index) => (
                    <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={exercise.title}
                          onChange={(e) => handleEditExercise(index, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                        <input
                          type="text"
                          value={exercise.instructions}
                          onChange={(e) => handleEditExercise(index, 'instructions', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <Textarea
                          value={exercise.content}
                          onChange={(e) => handleEditExercise(index, 'content', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="teacher">
          <div className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6">
            {!isEditing ? (
              renderMarkdown(editableTeacherNotes)
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Notes</label>
                <Textarea 
                  value={editableTeacherNotes}
                  onChange={(e) => setEditableTeacherNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md min-h-[300px]"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
