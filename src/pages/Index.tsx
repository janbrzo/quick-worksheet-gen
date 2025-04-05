
import React, { useState } from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus } from '@/types/worksheet';
import { FileText } from 'lucide-react';

const Index = () => {
  const {
    formData,
    worksheetData,
    generationStatus,
    updateField,
    resetForm,
    generateWorksheet
  } = useFormData();
  
  // State to control which page is visible
  const [currentPage, setCurrentPage] = useState(1);

  // Function to handle page switching
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
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
              duration={15} // Increased estimated duration
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
                </div>
                <WorksheetPreview data={worksheetData} />
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
