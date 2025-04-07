
import React from 'react';
import { WorksheetData } from '@/types/worksheet';

interface InputParametersPanelProps {
  data: WorksheetData;
}

const InputParametersPanel: React.FC<InputParametersPanelProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
      <h2 className="text-xl font-bold mb-4 text-edu-dark">Your Input Parameters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-3">
            <span className="font-bold text-edu-primary block mb-1">Lesson Duration:</span> 
            <span className="text-edu-dark">{data.lessonDuration} minutes</span>
          </div>
          
          <div className="mb-3">
            <span className="font-bold text-edu-primary block mb-1">Topic:</span> 
            <span className="text-edu-dark">{data.lessonTopic}</span>
          </div>
        </div>
        
        <div>
          <div className="mb-3">
            <span className="font-bold text-edu-primary block mb-1">Goal:</span> 
            <span className="text-edu-dark">{data.lessonObjective}</span>
          </div>
          
          <div className="mb-3">
            <span className="font-bold text-edu-primary block mb-1">Preferences:</span> 
            <span className="text-edu-dark">{data.preferences}</span>
          </div>
          
          {data.studentProfile && (
            <div className="mb-3">
              <span className="font-bold text-edu-primary block mb-1">Student Profile:</span> 
              <span className="text-edu-dark">{data.studentProfile}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputParametersPanel;
