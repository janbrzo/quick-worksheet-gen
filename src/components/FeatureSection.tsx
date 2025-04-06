
import React from 'react';
import { Clock, Award, FileCheck, Edit } from 'lucide-react';

const FeatureSection: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto mb-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-edu-light inline-block mb-3">
            <Clock className="text-edu-primary h-7 w-7" />
          </div>
          <h3 className="font-bold text-lg mb-2">Save Time</h3>
          <p className="text-gray-600 text-sm">Create in 5 minutes what would normally take 1-2 hours</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-edu-light inline-block mb-3">
            <Award className="text-edu-primary h-7 w-7" />
          </div>
          <h3 className="font-bold text-lg mb-2">Tailored Content</h3>
          <p className="text-gray-600 text-sm">Specific, industry-focused exercises for your students</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-edu-light inline-block mb-3">
            <FileCheck className="text-edu-primary h-7 w-7" />
          </div>
          <h3 className="font-bold text-lg mb-2">Ready to Use</h3>
          <p className="text-gray-600 text-sm">Professional formats requiring minimal edits (&lt; 10%)</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-full bg-edu-light inline-block mb-3">
            <Edit className="text-edu-primary h-7 w-7" />
          </div>
          <h3 className="font-bold text-lg mb-2">Customizable</h3>
          <p className="text-gray-600 text-sm">Edit worksheet content to fit your specific needs</p>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
