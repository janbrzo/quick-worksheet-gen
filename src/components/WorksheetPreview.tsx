
import React, { useRef } from 'react';
import { WorksheetData } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { Download, FileText, Star } from 'lucide-react';
import { toast } from 'sonner';

interface WorksheetPreviewProps {
  data: WorksheetData;
}

const WorksheetPreview: React.FC<WorksheetPreviewProps> = ({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold my-4">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold my-3 text-edu-primary">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 my-1">{line.replace('- ', '')}</li>;
      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || 
                 line.startsWith('4. ') || line.startsWith('5. ')) {
        return <ol key={index} className="ml-6 my-1">{line}</ol>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="my-2">{line}</p>;
      }
    });
  };

  const handleDownloadPDF = () => {
    // In a real implementation, you would use a library like jsPDF or html2pdf
    toast.success('PDF download feature will be implemented in the final version');
  };

  const handleDownloadDocx = () => {
    // In a real implementation, you would use a library like docx.js
    toast.success('DOCX download feature will be implemented in the final version');
  };

  const handleRateWorksheet = (rating: number) => {
    toast.success(`Thank you for rating this worksheet ${rating}/5!`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-edu-dark">{data.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadDocx}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            DOCX
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

      <div 
        ref={contentRef}
        className="border border-gray-200 rounded-lg p-6 bg-white min-h-[60vh] mb-6"
      >
        {renderMarkdown(data.content)}
      </div>

      {data.teacherNotes && (
        <div className="bg-edu-light p-4 rounded-lg mb-6 border border-edu-accent border-opacity-30">
          <h3 className="font-bold text-edu-dark mb-2">Wskazówki dla nauczyciela:</h3>
          <p className="text-sm text-gray-700">{data.teacherNotes}</p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-sm text-gray-500 italic">
            To ogólny worksheet stworzony na podstawie Twoich danych. 
            Podaj szczegółowe dane aby uzyskać bardziej spersonalizowane materiały dopasowane do uczniów.
          </p>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700 mr-2">Oceń worksheet:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button 
                key={rating}
                onClick={() => handleRateWorksheet(rating)}
                className="text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors"
              >
                <Star size={20} className="fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetPreview;
