
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
  
  // Calculate completed steps
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length || 1;
  const stepsProgress = Math.round((completedSteps / totalSteps) * 100);
  
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
      
      <div className="space-y-2 mt-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            {step.completed ? (
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-3">
                <Check className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-gray-300 mr-3"></div>
            )}
            <span className={step.completed ? 'text-gray-800' : 'text-gray-400'}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerationProgress;
