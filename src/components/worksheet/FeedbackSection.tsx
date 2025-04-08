
import React from 'react';
import { FeedbackData } from '@/types/worksheet';
import { Star } from 'lucide-react';

interface FeedbackSectionProps {
  feedbackData: FeedbackData;
  handleRateWorksheet: (rating: number) => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbackData,
  handleRateWorksheet
}) => {
  return (
    <div className="mt-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl text-center border border-indigo-100">
      <h4 className="text-lg font-bold text-indigo-900 mb-3">How would you rate this worksheet?</h4>
      <p className="text-sm text-indigo-700 mb-4">Your feedback helps us improve our AI-generated worksheets</p>
      
      <div className="flex justify-center mb-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button 
            key={rating}
            onClick={() => handleRateWorksheet(rating)}
            className={`mx-1 hover:scale-110 focus:outline-none transition-transform ${
              rating <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star 
              size={32} 
              className={`${rating <= feedbackData.rating ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent stroke-gray-300'}`}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      
      {feedbackData.rating > 0 && (
        <p className="text-sm font-medium text-indigo-700">
          {feedbackData.rating < 3 
            ? "We're sorry this worksheet didn't meet your expectations."
            : "Thank you for your positive feedback!"}
        </p>
      )}
    </div>
  );
};

export default FeedbackSection;
