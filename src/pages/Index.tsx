
import React, { useState, useRef } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus, WorksheetView } from '@/types/worksheet';
import { FileText, Clock, FileCheck, Edit, Award, Download, Info, ExternalLink } from 'lucide-react';
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
      // Redirect to Stripe payment link
      window.open('https://buy.stripe.com/dR69BW5Oq4MC52w9AA', '_blank');
      toast.info('Redirecting to payment page. After payment, return to download your worksheet.');
      setPaymentDialogOpen(false);
    }
  };
  
  // Function to simulate PDF download
  const downloadWorksheet = () => {
    try {
      // This will actually generate and download a real PDF
      if (!contentRef.current) {
        toast.error("Could not find content to download");
        return;
      }
      
      // Display processing message
      toast.success('Your worksheet is being prepared for download');
      
      // Create a proper filename
      const filename = `worksheet-${formData.lessonTopic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
      
      // Use html2canvas and jsPDF to generate the PDF
      import('html2canvas').then(html2canvasModule => {
        const html2canvas = html2canvasModule.default;
        html2canvas(contentRef.current, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false
        }).then(canvas => {
          import('jspdf').then(jsPDFModule => {
            // Fix: Correct way to import jsPDF
            const jsPDF = jsPDFModule.default;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(filename);
            
            toast.success('Worksheet downloaded successfully!');
          });
        });
      }).catch(err => {
        console.error("PDF generation error:", err);
        toast.error("Error generating PDF. Please try again.");
      });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Error downloading worksheet. Please try again.");
    }
  };

  // For PDF generation
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Disable printing
  React.useEffect(() => {
    const disablePrint = (e) => {
      e.preventDefault();
      toast.error("Printing is disabled. Please download the PDF instead.");
      return false;
    };
    
    window.addEventListener('beforeprint', disablePrint);
    
    // Also add CSS to prevent print
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('beforeprint', disablePrint);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-edu-dark text-white py-4">
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
                <Clock size={14} />
                <span>Save Time</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <Award size={14} />
                <span>Tailored Content</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <FileCheck size={14} />
                <span>Ready to Use</span>
              </div>
              <div className="bg-white bg-opacity-20 rounded-md px-3 py-1.5 text-sm flex items-center gap-1">
                <Edit size={14} />
                <span>Customizable</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentPage === 1 && (
          <div className="max-w-5xl mx-auto">
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
                <div className="mb-4 bg-white p-5 rounded-lg shadow-md border-l-4 border-edu-primary">
                  <h2 className="text-xl font-bold mb-4 text-edu-dark">Lesson Brief</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                        <span className="font-bold text-edu-primary block mb-1">Duration:</span> 
                        <span className="text-edu-dark text-lg">{formData.lessonDuration} minutes</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                        <span className="font-bold text-edu-primary block mb-1">Topic:</span> 
                        <span className="text-edu-dark text-lg">{formData.lessonTopic}</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                        <span className="font-bold text-edu-primary block mb-1">Objective:</span> 
                        <span className="text-edu-dark text-lg">{formData.lessonObjective}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                        <span className="font-bold text-edu-primary block mb-1">Activities:</span> 
                        <span className="text-edu-dark text-lg">{formData.preferences}</span>
                      </div>
                      
                      {formData.studentProfile && (
                        <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                          <span className="font-bold text-edu-primary block mb-1">Student Profile:</span> 
                          <span className="text-edu-dark text-lg">{formData.studentProfile}</span>
                        </div>
                      )}
                      
                      {formData.additionalInfo && (
                        <div className="bg-gradient-to-r from-edu-light to-white p-4 rounded-lg shadow-sm">
                          <span className="font-bold text-edu-primary block mb-1">Additional Info:</span> 
                          <span className="text-edu-dark text-lg">{formData.additionalInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-3 border-t border-gray-200 bg-edu-light bg-opacity-30 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-edu-primary bg-opacity-20">
                        <Clock size={20} className="text-edu-primary" />
                      </div>
                      <span className="text-edu-primary font-medium">
                        Generated in {worksheetData.generationTime} seconds
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-edu-primary bg-opacity-20">
                        <FileText size={20} className="text-edu-primary" />
                      </div>
                      <span className="text-edu-primary font-medium">
                        Based on {worksheetData.sourceCount} sources
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                  
                  <div className="flex items-center bg-yellow-50 p-2 rounded-lg border border-yellow-200 text-yellow-700 text-sm animate-pulse">
                    <Info size={16} className="mr-2" />
                    <span>You can edit worksheet content by clicking the Edit button</span>
                  </div>
                </div>
                
                <div ref={contentRef}>
                  <WorksheetPreview 
                    data={worksheetData} 
                    viewMode={worksheetView}
                    onDownload={() => setPaymentDialogOpen(true)}
                  />
                </div>
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
              <Button onClick={() => window.open('https://buy.stripe.com/dR69BW5Oq4MC52w9AA', '_blank')} 
                className="w-full bg-edu-primary hover:bg-edu-dark text-white flex items-center justify-center gap-2">
                Pay $1.00 and Download <ExternalLink size={16} />
              </Button>
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
            <Button onClick={handleDownloadWithPayment} className="flex items-center gap-2">
              <Download size={16} />
              {promoCode.toLowerCase() === 'edooqoo' ? 'Download with Promo' : 'Continue to Payment'}
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
