
import React, { useState, useEffect } from 'react';
import { GenerationStatus, GenerationStep } from '@/types/worksheet';
import { Loader2, Check, X, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  status: GenerationStatus;
  duration: number;
  steps: GenerationStep[];
  currentTime?: number;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  status, 
  duration,
  steps,
  currentTime = 0
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  // Calculate completed steps
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length || 1;
  const stepsProgress = Math.round((completedSteps / totalSteps) * 100);
  
  // Effect for updating active step based on completed steps
  useEffect(() => {
    if (status === GenerationStatus.GENERATING) {
      // Set active step to the latest completed step
      setActiveStep(Math.max(0, completedSteps - 1));
    } else if (status === GenerationStatus.COMPLETED) {
      setActiveStep(steps.length - 1);
    }
  }, [status, completedSteps, steps.length]);
  
  useEffect(() => {
    // Handle progress animation
    if (status === GenerationStatus.GENERATING) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const calculatedProgress = Math.min(prev + 100 / (duration * 10), 99);
          return calculatedProgress;
        });
      }, 100);
      
      // Timer for elapsed seconds
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    } else if (status === GenerationStatus.COMPLETED) {
      setProgress(100);
    } else {
      setProgress(0);
      setElapsedTime(0);
    }
  }, [status, duration]);
  
  // If not generating or completed, don't show anything
  if (status !== GenerationStatus.GENERATING && status !== GenerationStatus.COMPLETED) {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center mb-4">
        {status === GenerationStatus.GENERATING ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-edu-primary" />
        ) : (
          <Check className="mr-2 h-5 w-5 text-green-500" />
        )}
        
        <h2 className="text-xl font-bold">
          {status === GenerationStatus.GENERATING 
            ? `Generating Worksheet... (${elapsedTime}s)` 
            : `Generation Complete (${currentTime || elapsedTime}s)`
          }
        </h2>
      </div>
      
      <Progress 
        value={status === GenerationStatus.GENERATING ? progress : 100} 
        className="h-2 mb-4"
      />
      
      {/* Display only the current active step */}
      <div className="mt-4 bg-edu-light bg-opacity-50 p-3 rounded-md">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span className="text-gray-800 font-medium">
            {steps[activeStep]?.text || "Finalizing..."}
          </span>
        </div>
      </div>
      
      {/* Display step progress count */}
      <div className="mt-2 text-right text-sm text-gray-500">
        Step {completedSteps} of {totalSteps}
      </div>
    </div>
  );
};

export default GenerationProgress;
