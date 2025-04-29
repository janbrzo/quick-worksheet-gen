
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorksheetView } from '@/types/worksheet';
import { Download, Edit, Check, User, Lightbulb, Loader2 } from 'lucide-react';

interface WorksheetToolbarProps {
  viewMode: WorksheetView;
  setWorksheetView: (view: WorksheetView) => void;
  isEditing: boolean;
  handleEditToggle: () => void;
  downloadWorksheet: () => void;
  isGeneratingPdf?: boolean;
}

const WorksheetToolbar: React.FC<WorksheetToolbarProps> = ({
  viewMode,
  setWorksheetView,
  isEditing,
  handleEditToggle,
  downloadWorksheet,
  isGeneratingPdf = false
}) => {
  return (
    <div className="mb-6 flex flex-wrap md:flex-row items-center justify-between gap-4">
      <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl" role="group">
        <button
          onClick={() => setWorksheetView(WorksheetView.STUDENT)}
          className={`worksheet-view-button ${
            viewMode === WorksheetView.STUDENT 
              ? 'worksheet-view-button-active' 
              : 'worksheet-view-button-inactive'
          }`}
          aria-current={viewMode === WorksheetView.STUDENT ? "page" : undefined}
        >
          <User size={18} />
          Student View
        </button>
        <button
          onClick={() => setWorksheetView(WorksheetView.TEACHER)}
          className={`worksheet-view-button ${
            viewMode === WorksheetView.TEACHER 
              ? 'worksheet-view-button-active' 
              : 'worksheet-view-button-inactive'
          }`}
          aria-current={viewMode === WorksheetView.TEACHER ? "page" : undefined}
        >
          <Lightbulb size={18} />
          Teacher View
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        {isEditing && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            Click the Edit button to modify the worksheet →
          </div>
        )}
        
        <Button 
          variant={isEditing ? "default" : "outline"}
          onClick={handleEditToggle}
          className={`worksheet-action-button ${
            isEditing 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'border-purple-300 text-purple-600 hover:bg-purple-50'
          }`}
          disabled={isGeneratingPdf}
        >
          {isEditing ? <><Check size={16} /> Save Changes</> : <><Edit size={16} /> Edit Worksheet</>}
        </Button>
        <Button 
          onClick={downloadWorksheet}
          className="bg-purple-main hover:bg-purple-hover text-white worksheet-action-button"
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WorksheetToolbar;
