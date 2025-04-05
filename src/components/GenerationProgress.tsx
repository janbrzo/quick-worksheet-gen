
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { GenerationStatus, GenerationStep } from '@/types/worksheet';
import { Lightbulb, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  status: GenerationStatus;
  duration: number;
  steps?: GenerationStep[];
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  status, 
  duration,
  steps = []
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === GenerationStatus.GENERATING) {
      // Reset progress when generation starts
      setProgress(0);
      setCurrentStep(0);
      
      // Update progress based on steps completion
      if (steps.length > 0) {
        const completedSteps = steps.filter(step => step.completed).length;
        const percentage = (completedSteps / steps.length) * 100;
        setProgress(percentage);
        
        // Update current step if there's at least one completed step
        if (completedSteps > 0) {
          setCurrentStep(completedSteps - 1);
        }
      } else {
        // Fallback progress calculation when no steps provided
        const interval = 100 / (duration - 1);
        let counter = 0;
        
        timer = setInterval(() => {
          counter++;
          
          // Simulate steps taking longer toward the end for realism
          let increment = interval;
          if (counter > duration * 0.7) {
            increment = interval * 0.7;
          }
          
          setProgress(prev => {
            // Ensure we don't go over 95% as we wait for completion status
            const newProgress = prev + increment;
            return newProgress > 95 ? 95 : newProgress;
          });
          
          if (counter >= duration) {
            clearInterval(timer);
          }
        }, 1000);
      }
    } else if (status === GenerationStatus.COMPLETED) {
      setProgress(100);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, duration, steps]);
  
  if (status !== GenerationStatus.GENERATING && status !== GenerationStatus.COMPLETED) {
    return null;
  }
  
  const renderCurrentStep = () => {
    if (steps.length === 0 || currentStep >= steps.length) {
      return null;
    }
    
    return (
      <div className="animate-fade-in">
        <p className="text-edu-dark font-medium mb-1">
          {steps[currentStep].text}
        </p>
      </div>
    );
  };
  
  return (
    <div className="mb-8 p-5 bg-edu-light rounded-lg">
      <div className="flex items-center gap-3 mb-2">
        {status === GenerationStatus.GENERATING ? (
          <Loader2 className="h-5 w-5 text-edu-primary animate-spin" />
        ) : (
          <Lightbulb className="h-5 w-5 text-edu-primary" />
        )}
        <h3 className="text-lg font-semibold text-edu-dark">
          {status === GenerationStatus.GENERATING 
            ? "Generating your worksheet..." 
            : "Worksheet generation complete!"}
        </h3>
      </div>
      
      <div className="mb-4">
        {renderCurrentStep()}
      </div>
      
      <div className="mb-2">
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="text-sm text-gray-500 flex justify-between">
        <span>
          {status === GenerationStatus.GENERATING 
            ? `Processing...` 
            : "Completed!"}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>
    </div>
  );
};

export default GenerationProgress;
