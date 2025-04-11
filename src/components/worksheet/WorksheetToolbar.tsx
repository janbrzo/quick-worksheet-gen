
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorksheetView } from '@/types/worksheet';
import { Download, Edit, Check, FileText, User, Lightbulb } from 'lucide-react';

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
    <div className="sticky top-0 z-30 bg-gradient-to-r from-gray-50 to-white py-4 shadow-sm rounded-lg mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="inline-flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm" role="group">
          <button
            onClick={() => setWorksheetView(WorksheetView.STUDENT)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
              viewMode === WorksheetView.STUDENT 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === WorksheetView.STUDENT ? "page" : undefined}
          >
            <User size={16} />
            Student View
          </button>
          <button
            onClick={() => setWorksheetView(WorksheetView.TEACHER)}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2 ml-1 transition-all ${
              viewMode === WorksheetView.TEACHER 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={viewMode === WorksheetView.TEACHER ? "page" : undefined}
          >
            <Lightbulb size={16} />
            Teacher View
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant={isEditing ? "default" : "outline"}
            onClick={handleEditToggle}
            className={`flex items-center gap-2 ${
              isEditing 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0' 
                : 'border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
            }`}
            size="sm"
          >
            {isEditing ? <><Check size={16} /> Save Changes</> : <><Edit size={16} /> Edit Worksheet</>}
          </Button>
          <Button 
            onClick={downloadWorksheet}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0 flex items-center gap-2 shadow-md"
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
