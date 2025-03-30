
import React from 'react';
import WorksheetForm from '@/components/WorksheetForm';
import WorksheetPreview from '@/components/WorksheetPreview';
import GenerationProgress from '@/components/GenerationProgress';
import { useFormData } from '@/hooks/useFormData';
import { GenerationStatus } from '@/types/worksheet';

const Index = () => {
  const {
    formData,
    worksheetData,
    generationStatus,
    updateField,
    resetForm,
    generateWorksheet
  } = useFormData();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-edu-dark text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Quick Worksheet Generator</h1>
          <p className="text-edu-light mt-1">
            Twórz profesjonalne worksheety dla nauczania języka angielskiego w mniej niż 5 minut
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <WorksheetForm
              formData={formData}
              updateField={updateField}
              generateWorksheet={generateWorksheet}
              resetForm={resetForm}
              generationStatus={generationStatus}
            />
          </div>
          
          <div>
            <GenerationProgress 
              status={generationStatus} 
              duration={10} // Estimated 10 seconds for generation
            />
            
            {worksheetData && generationStatus === GenerationStatus.COMPLETED && (
              <WorksheetPreview data={worksheetData} />
            )}
            
            {!worksheetData && generationStatus !== GenerationStatus.GENERATING && (
              <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                <div className="bg-edu-light p-6 rounded-full mb-6">
                  <FileText size={48} className="text-edu-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-edu-dark">
                  Twój worksheet pojawi się tutaj
                </h2>
                <p className="text-gray-600 max-w-md">
                  Wypełnij formularz i kliknij "Generuj worksheet" aby stworzyć 
                  spersonalizowany materiał dydaktyczny dla Twojej lekcji angielskiego.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2023 Quick Worksheet Generator</p>
          <p className="mt-2">
            Narzędzie dla nauczycieli języka angielskiego umożliwiające szybkie tworzenie 
            profesjonalnych materiałów dydaktycznych
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
