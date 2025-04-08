
import React from 'react';
import { WorksheetData } from '@/types/worksheet';
import { Clock, Target, BookOpen, Lightbulb, Users, Info } from 'lucide-react';

interface InputParametersPanelProps {
  data: WorksheetData;
}

const InputParametersPanel: React.FC<InputParametersPanelProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 mb-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
          <Info size={18} />
        </span>
        Your Input Parameters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
          <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <Clock size={16} />
          </div>
          <div>
            <span className="block font-medium text-gray-700">Lesson Duration</span>
            <span className="text-gray-600">{data.lessonDuration} minutes</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
          <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <BookOpen size={16} />
          </div>
          <div>
            <span className="block font-medium text-gray-700">Topic</span>
            <span className="text-gray-600">{data.topic}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors">
          <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <Target size={16} />
          </div>
          <div>
            <span className="block font-medium text-gray-700">Objective</span>
            <span className="text-gray-600">{data.objective}</span>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors md:col-span-2 lg:col-span-3">
          <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <Lightbulb size={16} />
          </div>
          <div>
            <span className="block font-medium text-gray-700">Teaching Preferences</span>
            <span className="text-gray-600">{data.preferences}</span>
          </div>
        </div>
        
        {data.studentProfile && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors md:col-span-2 lg:col-span-3">
            <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
              <Users size={16} />
            </div>
            <div>
              <span className="block font-medium text-gray-700">Student Profile</span>
              <span className="text-gray-600">{data.studentProfile}</span>
            </div>
          </div>
        )}
        
        {data.additionalInfo && (
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors md:col-span-2 lg:col-span-3">
            <div className="mt-0.5 p-1.5 rounded-md bg-indigo-100 text-indigo-600">
              <Info size={16} />
            </div>
            <div>
              <span className="block font-medium text-gray-700">Additional Information</span>
              <span className="text-gray-600">{data.additionalInfo}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputParametersPanel;
