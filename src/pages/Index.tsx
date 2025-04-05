
import React, { useState } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { FileText } from 'lucide-react';
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
    generateWorksheet
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
          <div className="max-w-4xl mx-auto">
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
            />
            
            {worksheetData && generationStatus === GenerationStatus.COMPLETED && (
              <div>
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <h2 className="text-xl font-bold mb-2">Lesson Brief</h2>
                  <ul className="space-y-2">
                    <li><strong>Duration:</strong> {formData.lessonDuration} minutes</li>
                    <li><strong>Topic:</strong> {formData.lessonTopic}</li>
                    <li><strong>Objective:</strong> {formData.lessonObjective}</li>
                    <li><strong>Activities:</strong> {formData.preferences}</li>
                    {formData.studentProfile && <li><strong>Student Profile:</strong> {formData.studentProfile}</li>}
                  </ul>
                  
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
