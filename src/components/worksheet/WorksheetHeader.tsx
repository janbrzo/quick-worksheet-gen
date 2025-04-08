
import React from 'react';
import { WorksheetData } from '@/types/worksheet';
import { Zap, Database, Clock } from 'lucide-react';

interface WorksheetHeaderProps {
  data: WorksheetData;
}

const WorksheetHeader: React.FC<WorksheetHeaderProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl mb-6 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Your Generated Worksheet</h2>
          <p className="text-white/80 text-sm">AI-powered learning materials tailored to your specifications</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg">
            <Zap size={16} className="text-yellow-300" /> 
            <span>Generated in <span className="font-bold">{data.generationTime}s</span></span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg">
            <Database size={16} className="text-blue-300" /> 
            <span>Based on <span className="font-bold">{data.sourceCount}</span> sources</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg">
            <Clock size={16} className="text-green-300" /> 
            <span><span className="font-bold">{data.lessonDuration}</span> min lesson</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetHeader;
