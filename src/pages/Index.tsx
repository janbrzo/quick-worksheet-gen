
import React, { useState, useRef, useEffect } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import FeatureSection from '@/components/FeatureSection';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { FileText, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // State for generation modal
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  
  // State for worksheet view (student/teacher)
  const [worksheetView, setWorksheetView] = useState<WorksheetView>(WorksheetView.STUDENT);

  // For PDF generation
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Function to handle page switching
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  
  // Effect to show generation modal
  useEffect(() => {
    if (generationStatus === GenerationStatus.GENERATING) {
      setShowGenerationModal(true);
    } else if (generationStatus === GenerationStatus.COMPLETED) {
      // Close modal after a slight delay when generation is complete
      setTimeout(() => {
        setShowGenerationModal(false);
        goToPage(2);
      }, 1000);
    }
  }, [generationStatus]);

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Function to handle download with payment or promo
  const handleDownloadWithPayment = () => {
    if (promoCode.toLowerCase() === 'edooqoo') {
      // Apply promo code
      toast.success('Promo code applied! Downloading worksheet...');
      setPaymentComplete(true);
      setPaymentDialogOpen(false);
    } else {
      // Redirect to Stripe payment link
      window.open('https://buy.stripe.com/dR69BW5Oq4MC52w9AA', '_blank');
      toast.info('Redirecting to payment page. After payment, return to download your worksheet.');
      
      // For demo purposes, we'll simulate payment completion
      // In a real app, this would be handled by a webhook from Stripe
      setTimeout(() => {
        setPaymentComplete(true);
        toast.success('Payment received! You can now download your worksheets.');
      }, 5000);
      
      setPaymentDialogOpen(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-edu-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Quick Worksheet Generator</h1>
              <p className="text-edu-light mt-1">
                Create professional English teaching worksheets in less than 5 minutes
              </p>
            </div>
            
            {/* Feature tiles in header - smaller version */}
            <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <span>Save Time</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <span>Tailored Content</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <span>Ready to Use</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <span>Customizable</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Features section with descriptions - only on page 1 */}
        {currentPage === 1 && <FeatureSection />}
        
        <main className="max-w-6xl mx-auto">
          {currentPage === 1 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="md:order-1">
                <WorksheetForm
                  formData={formData}
                  updateField={updateField}
                  generateWorksheet={() => {
                    generateWorksheet();
                  }}
                  resetForm={resetForm}
                  generationStatus={generationStatus}
                />
              </div>
              
              <div className="md:order-2">
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
              </div>
            </div>
          )}
          
          {currentPage === 2 && (
            <div>
              <div className="mb-6">
                <button 
                  onClick={() => goToPage(1)} 
                  className="text-edu-primary hover:text-edu-dark flex items-center gap-1"
                >
                  ← Back to Form
                </button>
              </div>
              
              {worksheetData && generationStatus === GenerationStatus.COMPLETED && (
                <WorksheetPreview 
                  data={worksheetData} 
                  viewMode={worksheetView}
                  onDownload={() => paymentComplete ? null : setPaymentDialogOpen(true)}
                  setWorksheetView={setWorksheetView}
                  paymentComplete={paymentComplete}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Fixed scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-edu-primary text-white rounded-full shadow-lg hover:bg-edu-dark transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      {/* Generation Modal */}
      <Dialog open={showGenerationModal} onOpenChange={setShowGenerationModal}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <div className="py-4">
            <GenerationProgress 
              status={generationStatus}
              duration={60} // Longer animation duration 
              steps={generationSteps}
              currentTime={generationTime}
            />
          </div>
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
