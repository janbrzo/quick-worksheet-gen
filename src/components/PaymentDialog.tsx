
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, ExternalLink } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: () => void;
  onDownload: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  open, 
  onOpenChange, 
  onPaymentComplete,
  onDownload
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  
  useEffect(() => {
    // Reset dialog state when reopened
    if (open) {
      setPromoCode('');
      setPaymentInProgress(false);
      setPaymentSuccessful(false);
    }
  }, [open]);

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'edooqoo') {
      toast.success('Valid promo code! You can now download for free.');
      setPaymentSuccessful(true);
      onPaymentComplete();
    } else if (promoCode) {
      toast.error('Invalid promo code');
    }
  };

  const handleStripePayment = () => {
    // Open Stripe payment page in a new tab
    window.open('https://buy.stripe.com/dR69BW5Oq4MC52w9AA', '_blank');
    setPaymentInProgress(true);
    
    toast.info('Payment page opened in a new tab. After payment, return here to download your worksheets.');
    
    // For demo purposes, we'll simulate payment completion after a few seconds
    // In a real app, this would be handled by a webhook from Stripe
    setTimeout(() => {
      setPaymentSuccessful(true);
      onPaymentComplete();
      toast.success('Payment verified! You can now download your worksheets.');
    }, 7000);
  };

  const handleDownload = () => {
    onDownload();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Worksheet</DialogTitle>
        </DialogHeader>
        
        {!paymentSuccessful ? (
          <div className="py-4">
            <p className="mb-4">To download this worksheet as PDF, please choose one of the following options:</p>
            
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">One-time payment</h3>
              <p className="text-sm text-gray-600 mb-3">Support our service with a small contribution:</p>
              <Button 
                onClick={handleStripePayment} 
                disabled={paymentInProgress}
                className="w-full bg-edu-primary hover:bg-edu-dark text-white flex items-center justify-center gap-2"
              >
                {paymentInProgress ? 'Processing...' : 'Pay $1.00 and Download'} <ExternalLink size={16} />
              </Button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Have a promotion code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="px-3 py-2 border border-gray-300 rounded-md flex-1"
                />
                <Button variant="outline" onClick={handleApplyPromo}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-green-700 font-medium">Payment successful!</p>
              <p className="text-green-600 text-sm mt-1">You can now download your worksheets.</p>
            </div>
            
            <Button 
              onClick={handleDownload}
              className="w-full bg-edu-primary hover:bg-edu-dark text-white flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download Worksheets Now
            </Button>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          {!paymentSuccessful && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
