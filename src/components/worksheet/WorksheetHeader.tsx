
import React from 'react';
import { WorksheetData } from '@/types/worksheet';
import { Zap, Database } from 'lucide-react';

interface WorksheetHeaderProps {
  data: WorksheetData;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-lg mb-6 flex justify-between items-center">
      <h2 className="text-xl font-bold">Your Generated Worksheet</h2>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1 bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-md">
          <Zap size={16} /> Generated in {data.generationTime} seconds
        </div>
        <div className="inline-flex items-center gap-1 bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-md">
          <Database size={16} /> Based on {data.sourceCount} sources
        </div>
      </div>
    </div>
  );
};

export default WorksheetHeader;
