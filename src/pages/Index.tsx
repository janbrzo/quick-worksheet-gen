
import React, { useState } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { FileText, Clock, FileCheck, Edit, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const {
    formData,
    worksheetData,
    generationStatus,
    generationSteps,
    updateField,
    resetForm,
    generateWorksheet,
    generationTime
  } = useFormData();
  
  // State to control which page is visible
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  
  // State for worksheet view (student/teacher)
  const [worksheetView, setWorksheetView] = useState<WorksheetView>(WorksheetView.STUDENT);

  // Function to handle page switching
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Function to handle download with payment or promo
  const handleDownloadWithPayment = () => {
    if (promoCode.toLowerCase() === 'edooqoo') {
      // Apply promo code
      toast.success('Promo code applied! Downloading worksheet...');
      downloadWorksheet();
      setPaymentDialogOpen(false);
    } else {
      // In a real app, this would redirect to a payment gateway
      toast.success('Payment processed! Downloading worksheet...');
      downloadWorksheet();
      setPaymentDialogOpen(false);
    }
  };
  
  // Function to simulate PDF download
  const downloadWorksheet = () => {
    // This is a mock implementation
    toast.success('Your worksheet is being prepared for download');
    
    // In a real implementation, this would create and download a PDF
    setTimeout(() => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Worksheet content would be here'));
      element.setAttribute('download', `worksheet-${formData.lessonTopic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success('Worksheet downloaded successfully!');
    }, 1000);
  };

  // Disable printing
  React.useEffect(() => {
    const disablePrint = (e) => {
      e.preventDefault();
      toast.error("Printing is disabled. Please download the PDF instead.");
      return false;
    };
    
    window.addEventListener('beforeprint', disablePrint);
    
    return () => {
      window.removeEventListener('beforeprint', disablePrint);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-edu-dark text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quick Worksheet Generator</h1>
          <p className="text-edu-light mt-1">
            Create professional English teaching worksheets in less than 5 minutes
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentPage === 1 && (
          <div className="max-w-5xl mx-auto">
            {/* Feature Tiles Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-center mb-8 text-edu-dark">
                Create professional, tailored worksheets for your English lessons in minutes instead of hours
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-edu-primary hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-edu-light text-edu-primary mr-4">
                      <Clock size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Save Time</h3>
                  </div>
                  <p className="text-gray-600">
                    Create in 5 minutes what would normally take 1-2 hours
                  </p>
                </div>
                
                {/* Feature 2 */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-edu-primary hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-edu-light text-edu-primary mr-4">
                      <Award size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Tailored Content</h3>
                  </div>
                  <p className="text-gray-600">
                    Specific, industry-focused exercises for your students
                  </p>
                </div>
                
                {/* Feature 3 */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-edu-primary hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-edu-light text-edu-primary mr-4">
                      <FileCheck size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Ready to Use</h3>
                  </div>
                  <p className="text-gray-600">
                    Professional formats requiring minimal edits ({"<"} 10%)
                  </p>
                </div>
                
                {/* Feature 4 */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-edu-primary hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-edu-light text-edu-primary mr-4">
                      <Edit size={24} />
                    </div>
                    <h3 className="font-bold text-lg">Customizable</h3>
                  </div>
                  <p className="text-gray-600">
                    Edit worksheet content as needed for your classes
                  </p>
                </div>
              </div>
            </div>
            
            <WorksheetForm
              formData={formData}
              updateField={updateField}
              generateWorksheet={() => {
                generateWorksheet();
                if (generationStatus !== GenerationStatus.ERROR) {
                  goToPage(2);
                }
              }}
              resetForm={resetForm}
              generationStatus={generationStatus}
            />
          </div>
        )}
        
        {currentPage === 2 && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={() => goToPage(1)} 
                className="text-edu-primary hover:text-edu-dark flex items-center gap-1"
              >
                ← Back to Form
              </button>
            </div>
            
            <GenerationProgress 
              status={generationStatus} 
              duration={15}
              steps={generationSteps}
              currentTime={generationTime}
            />
            
            {worksheetData && generationStatus === GenerationStatus.COMPLETED && (
              <div>
                <div className="mb-4 bg-white p-5 rounded-lg shadow border-l-4 border-edu-primary">
                  <h2 className="text-xl font-bold mb-4 text-edu-dark">Lesson Brief</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                        <span className="font-bold text-edu-primary">Duration:</span> 
                        <span className="ml-2">{formData.lessonDuration} minutes</span>
                      </div>
                      
                      <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                        <span className="font-bold text-edu-primary">Topic:</span> 
                        <span className="ml-2">{formData.lessonTopic}</span>
                      </div>
                      
                      <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                        <span className="font-bold text-edu-primary">Objective:</span> 
                        <span className="ml-2">{formData.lessonObjective}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                        <span className="font-bold text-edu-primary">Activities:</span> 
                        <span className="ml-2">{formData.preferences}</span>
                      </div>
                      
                      {formData.studentProfile && (
                        <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                          <span className="font-bold text-edu-primary">Student Profile:</span> 
                          <span className="ml-2">{formData.studentProfile}</span>
                        </div>
                      )}
                      
                      {formData.additionalInfo && (
                        <div className="bg-edu-light bg-opacity-30 p-3 rounded-lg">
                          <span className="font-bold text-edu-primary">Additional Info:</span> 
                          <span className="ml-2">{formData.additionalInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200 text-sm">
                    <p className="text-edu-primary font-medium">
                      Generated in {worksheetData.generationTime} seconds • Based on {worksheetData.sourceCount} sources
                    </p>
                  </div>
                </div>
                
                <div className="mb-4 flex justify-end">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      onClick={() => setWorksheetView(WorksheetView.STUDENT)}
                      className={`px-4 py-2 text-sm font-medium border border-r-0 rounded-l-lg focus:z-10 focus:outline-none ${
                        worksheetView === WorksheetView.STUDENT 
                          ? 'bg-edu-primary text-white border-edu-primary' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
                      }`}
                    >
                      Student View
                    </button>
                    <button
                      onClick={() => setWorksheetView(WorksheetView.TEACHER)}
                      className={`px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:outline-none ${
                        worksheetView === WorksheetView.TEACHER 
                          ? 'bg-edu-primary text-white border-edu-primary' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
                      }`}
                    >
                      Teacher View
                    </button>
                  </div>
                </div>
                
                <WorksheetPreview 
                  data={worksheetData} 
                  viewMode={worksheetView}
                  onDownload={() => setPaymentDialogOpen(true)}
                />
              </div>
            )}
            
            {generationStatus !== GenerationStatus.GENERATING && generationStatus !== GenerationStatus.COMPLETED && (
              <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                <div className="bg-edu-light p-6 rounded-full mb-6">
                  <FileText size={48} className="text-edu-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-edu-dark">
                  Your worksheet will appear here
                </h2>
                <p className="text-gray-600 max-w-md">
                  Fill out the form and click "Generate worksheet" to create
                  a personalized teaching material for your English lesson.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Worksheet</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">To download this worksheet as PDF, please choose one of the following options:</p>
            
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">One-time payment</h3>
              <p className="text-sm text-gray-600 mb-3">Support our service with a small contribution:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="w-full">$1.00</Button>
                <Button variant="outline" className="w-full bg-edu-light border-edu-primary text-edu-primary">$2.00</Button>
                <Button variant="outline" className="w-full">$5.00</Button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Have a promotion code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                />
                <Button variant="outline" onClick={() => {
                  if (promoCode.toLowerCase() === 'edooqoo') {
                    toast.success('Valid promo code!');
                  } else if (promoCode) {
                    toast.error('Invalid promo code');
                  }
                }}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownloadWithPayment}>
              {promoCode.toLowerCase() === 'edooqoo' ? 'Download with Promo' : 'Pay & Download'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2023 Quick Worksheet Generator</p>
          <p className="mt-2">
            A tool for English teachers to quickly create professional teaching materials
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
