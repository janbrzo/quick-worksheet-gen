
import React, { useState, useEffect } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { ArrowLeft, ArrowUp, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    generationTime,
    openAIKey,
    storeApiKey
  } = useFormData();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [worksheetView, setWorksheetView] = useState<WorksheetView>(WorksheetView.STUDENT);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (generationStatus === GenerationStatus.GENERATING) {
      setShowGenerationModal(true);
    } else if (generationStatus === GenerationStatus.COMPLETED) {
      setTimeout(() => {
        setShowGenerationModal(false);
        goToPage(2);
      }, 1000);
    }
  }, [generationStatus]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-4 py-8">
        <main className="max-w-6xl mx-auto">
          {!openAIKey && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Key className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">OpenAI API Key Required</span>
                  </p>
                  <p className="mt-1 text-sm text-amber-600">
                    You need to provide an OpenAI API key to generate worksheets with AI. Without a key, mock data will be used instead.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowApiKeyModal(true)}
                      className="text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                    >
                      Add API Key
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === 1 ? (
            <WorksheetForm
              formData={formData}
              updateField={updateField}
              generateWorksheet={generateWorksheet}
              resetForm={resetForm}
              generationStatus={generationStatus}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => goToPage(1)} 
                  className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <ArrowLeft size={18} />
                  Create New Worksheet
                </button>
              </div>
              
              {worksheetData && generationStatus === GenerationStatus.COMPLETED && (
                <WorksheetPreview 
                  data={worksheetData} 
                  viewMode={worksheetView}
                  onDownload={() => null}
                  setWorksheetView={setWorksheetView}
                  paymentComplete={true}
                />
              )}
            </>
          )}
        </main>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-purple-main text-white rounded-full shadow-lg hover:bg-purple-hover transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <Dialog open={showGenerationModal} onOpenChange={setShowGenerationModal}>
        <DialogContent className="sm:max-w-md">
          <div className="py-4">
            <GenerationProgress 
              status={generationStatus}
              duration={60}
              steps={generationSteps}
              currentTime={generationTime}
            />
          </div>
        </DialogContent>
      </Dialog>

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
            <Button onClick={handleApiKeySubmit} className="bg-purple-main hover:bg-purple-hover">
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
