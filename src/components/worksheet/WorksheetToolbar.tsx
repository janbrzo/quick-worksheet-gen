
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorksheetView } from '@/types/worksheet';
import { Download, Edit, Check } from 'lucide-react';

interface WorksheetToolbarProps {
  viewMode: WorksheetView;
  setWorksheetView: (view: WorksheetView) => void;
  isEditing: boolean;
  handleEditToggle: () => void;
  handleDownloadWorksheet: () => void;
}

const WorksheetToolbar: React.FC<WorksheetToolbarProps> = ({ 
  viewMode, 
  setWorksheetView,
  isEditing,
  handleEditToggle,
  handleDownloadWorksheet
}) => {
  return (
    <div className="sticky top-0 z-30 bg-gray-50 py-3">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setWorksheetView(WorksheetView.STUDENT)}
            className={`px-4 py-2 text-sm font-medium border border-r-0 rounded-l-lg focus:z-10 focus:outline-none ${
              viewMode === WorksheetView.STUDENT 
                ? 'bg-edu-primary text-white border-edu-primary' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setWorksheetView(WorksheetView.TEACHER)}
            className={`px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:outline-none ${
              viewMode === WorksheetView.TEACHER 
                ? 'bg-edu-primary text-white border-edu-primary' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-edu-light'
            }`}
          >
            Teacher View
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={handleEditToggle}
            className={`flex items-center gap-2 ${
              isEditing 
                ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' 
                : 'border-edu-primary text-edu-primary hover:bg-edu-light relative overflow-hidden group'
            }`}
            size="sm"
          >
            {isEditing ? (
              <><Check size={16} /> Save Changes</>
            ) : (
              <>
                <Edit size={16} /> Edit Worksheet
                <span className="absolute inset-0 w-full h-full bg-edu-primary opacity-10 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              </>
            )}
          </Button>
          <Button 
            onClick={handleDownloadWorksheet}
            className="bg-edu-primary hover:bg-edu-dark text-white flex items-center gap-2"
            size="sm"
          >
            <Download size={16} />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorksheetToolbar;
