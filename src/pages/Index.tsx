
import React, { useState, useRef, useEffect } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import FeatureSection from '@/components/FeatureSection';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { FileText, ArrowUp, Zap, Database, ArrowLeft, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const Index = () => {
  const {
    formData,
    worksheetData,
    generationStatus,
    generationSteps,
    updateField,
    resetForm,
    generateWorksheet,
    generationTime,
    openAIKey,
    storeApiKey
  } = useFormData();
  
  // State to control which page is visible
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for payment dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(true); // Set to true to skip payment
  
  // State for generation modal
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  
  // State for API key modal
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (!apiKeyInput || apiKeyInput.trim().length < 10) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }
    
    storeApiKey(apiKeyInput.trim());
    setShowApiKeyModal(false);
    toast.success('API key saved successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-edu-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Create Your Worksheet</h1>
              <p className="text-edu-light mt-1">
                Quick, professional English teaching materials in minutes
              </p>
            </div>
            
            {/* Enhanced feature icons in header */}
            <div className="grid grid-cols-4 gap-3 mt-4 md:mt-0">
              <div className="flex flex-col items-center text-center p-2 bg-white bg-opacity-20 rounded-md">
                <FileText className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Save Time</span>
                <span className="text-xs hidden lg:block">5-min creation</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-white bg-opacity-20 rounded-md">
                <Zap className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Tailored</span>
                <span className="text-xs hidden lg:block">Industry-focused</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-white bg-opacity-20 rounded-md">
                <FileText className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Ready</span>
                <span className="text-xs hidden lg:block">Professional format</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-white bg-opacity-20 rounded-md">
                <FileText className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Customizable</span>
                <span className="text-xs hidden lg:block">Easy to edit</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-8 pb-16">
        <main className="max-w-screen-xl mx-auto">
          {currentPage === 1 && (
            <div className="w-full">
              {/* API Key banner */}
              {!openAIKey && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Key className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <span className="font-medium">OpenAI API Key Required</span>
                      </p>
                      <p className="mt-1 text-sm text-yellow-600">
                        You need to provide an OpenAI API key to generate worksheets with AI. Without a key, mock data will be used instead.
                      </p>
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowApiKeyModal(true)}
                          className="text-xs border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                        >
                          Add API Key
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
          )}
          
          {currentPage === 2 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => goToPage(1)} 
                  className="text-edu-primary hover:text-edu-dark flex items-center gap-1"
                >
                  <ArrowLeft size={18} />
                  Create New Worksheet
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
        <DialogContent className="sm:max-w-md">
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
      
      {/* API Key Modal */}
      <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter your OpenAI API Key</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Your API key will be stored in your browser session only and will not be sent to our servers.
              It will be used to generate worksheets using OpenAI's API.
            </p>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApiKeySubmit}>
              Save API Key
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
