
import React from 'react';
import { FeedbackData } from '@/types/worksheet';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FeedbackDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  feedbackData: FeedbackData;
  setFeedbackData: (data: FeedbackData) => void;
  onSubmit: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  setOpen,
  feedbackData,
  setFeedbackData,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your feedback is important!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button 
                key={rating}
                onClick={() => setFeedbackData({ ...feedbackData, rating })}
                className={`text-gray-400 mx-1 hover:text-yellow-400 focus:outline-none transition-colors ${
                  rating <= feedbackData.rating ? 'text-yellow-400' : ''
                }`}
              >
                <Star size={24} className="fill-current" />
              </button>
            ))}
          </div>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What did you think about this worksheet? (optional)
          </label>
          <Textarea
            value={feedbackData.comment}
            onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
            placeholder="Your feedback helps us improve our worksheet generator"
            className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
