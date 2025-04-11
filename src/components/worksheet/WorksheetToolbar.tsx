
import React from 'react';
import { WorksheetView } from '@/types/worksheet';
import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  Pencil,
  Save,
  UserCheck, 
  GraduationCap
} from 'lucide-react';

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
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm py-2 px-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === WorksheetView.STUDENT ? "default" : "outline"}
            size="sm"
            onClick={() => setWorksheetView(WorksheetView.STUDENT)}
            className="flex items-center gap-2"
          >
            <UserCheck size={16} />
            <span>Student View</span>
          </Button>
          <Button
            variant={viewMode === WorksheetView.TEACHER ? "default" : "outline"}
            size="sm"
            onClick={() => setWorksheetView(WorksheetView.TEACHER)}
            className="flex items-center gap-2"
          >
            <GraduationCap size={16} />
            <span>Teacher View</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isEditing ? "success" : "outline"}
            size="sm"
            onClick={handleEditToggle}
            className={`flex items-center gap-2 ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
          >
            {isEditing ? (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Pencil size={16} />
                <span>Edit Worksheet</span>
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadWorksheet}
            className="flex items-center gap-2"
          >
            <FileDown size={16} />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorksheetToolbar;
