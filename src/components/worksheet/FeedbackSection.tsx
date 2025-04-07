
import React from 'react';
import { Star } from 'lucide-react';
import { FeedbackData } from '@/types/worksheet';

interface FeedbackSectionProps {
  feedbackData: FeedbackData;
  handleRateWorksheet: (rating: number) => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ 
  feedbackData, 
  handleRateWorksheet 
}) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm text-gray-500 italic">
          This is a general worksheet created based on your input. 
          Provide more specific details to get more personalized materials tailored to your students.
        </p>
        
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-700 mr-2">Rate this worksheet:</span>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button 
              key={rating}
              onClick={() => handleRateWorksheet(rating)}
              className={`text-gray-400 hover:text-yellow-400 focus:outline-none transition-colors ${
                rating <= feedbackData.rating ? 'text-yellow-400' : ''
              }`}
            >
              <Star size={20} className="fill-current" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
