
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Download, Save, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { WorksheetView } from '@/types/worksheet';

interface WorksheetToolbarProps {
  viewMode: WorksheetView;
  setWorksheetView: (view: WorksheetView) => void;
  isEditing: boolean;
  handleEditToggle: () => void;
  downloadWorksheet: () => void;
}

const WorksheetToolbar: React.FC<WorksheetToolbarProps> = ({
  viewMode,
  setWorksheetView,
  isEditing,
  handleEditToggle,
  downloadWorksheet
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
      <div className="flex items-center space-x-2 mb-4 sm:mb-0">
        <Button
          variant={viewMode === WorksheetView.STUDENT ? "default" : "outline"}
          onClick={() => setWorksheetView(WorksheetView.STUDENT)}
          className="flex items-center gap-2 bg-edu-primary hover:bg-edu-dark"
        >
          <Eye size={16} />
          <span>Student View</span>
        </Button>
        <Button
          variant={viewMode === WorksheetView.TEACHER ? "default" : "outline"}
          onClick={() => setWorksheetView(WorksheetView.TEACHER)}
          className={`flex items-center gap-2 ${viewMode === WorksheetView.TEACHER ? "bg-edu-primary hover:bg-edu-dark" : ""}`}
        >
          <EyeOff size={16} />
          <span>Teacher View</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {isEditing ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md flex items-center">
            <Edit size={16} className="mr-2 text-amber-600" />
            <span className="text-sm font-medium">Editing Mode</span>
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-md flex items-center">
            <ArrowRight size={16} className="mr-2 text-indigo-600" />
            <span className="text-sm font-medium">Click the button to edit your worksheet</span>
          </div>
        )}
        
        <Button
          variant={isEditing ? "secondary" : "outline"}
          onClick={handleEditToggle}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isEditing ? <Save size={16} /> : <Edit size={16} />}
          <span>{isEditing ? "Save Changes" : "Edit Worksheet"}</span>
        </Button>
        
        <Button
          variant="default"
          onClick={downloadWorksheet}
          className="flex items-center gap-2 bg-edu-primary hover:bg-edu-dark"
        >
          <Download size={16} />
          <span>Download PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default WorksheetToolbar;
