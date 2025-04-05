
import React, { useState, useEffect } from 'react';
import { GenerationStatus } from '@/types/worksheet';
import { BookOpen, Database, Clock, FileText } from 'lucide-react';

interface GenerationProgressProps {
  status: GenerationStatus;
  duration: number; // Estimated duration in seconds
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ status, duration }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sourcesCount, setSourcesCount] = useState(0);
  const [generationTime, setGenerationTime] = useState(0);

  const generationSteps = [
    "Analyzing request...",
    "Researching educational content...",
    "Identifying key language patterns...",
    "Creating structured exercises...",
    "Generating teacher notes...",
    "Finalizing worksheet layout..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === GenerationStatus.GENERATING) {
      const startTime = Date.now();
      
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate progress percentage (max 95% until complete)
        const calculatedProgress = Math.min(95, (elapsed / duration) * 100);
        setProgress(calculatedProgress);
        
        // Update step based on progress
        const stepIndex = Math.min(
          Math.floor((calculatedProgress / 95) * generationSteps.length),
          generationSteps.length - 1
        );
        setCurrentStep(stepIndex);
      }, 100);
    } else if (status === GenerationStatus.COMPLETED) {
      setProgress(100);
      // Generate random finalization data for demo purposes
      const randomTime = Math.floor(Math.random() * (46 - 31 + 1)) + 31;
      const randomSources = Math.floor(Math.random() * (100 - 51 + 1)) + 51;
      setGenerationTime(randomTime);
      setSourcesCount(randomSources);
    } else {
      setProgress(0);
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, duration, generationSteps.length]);

  if (status !== GenerationStatus.GENERATING && status !== GenerationStatus.COMPLETED) {
    return null;
  }

  return (
    <div className="w-full space-y-3 mb-6 bg-white p-4 rounded-lg shadow-sm">
      {status === GenerationStatus.GENERATING && (
        <>
          <div className="flex justify-between text-sm text-gray-700">
            <span className="flex items-center">
              <Clock size={16} className="mr-2" />
              Generating worksheet... {elapsedTime}s
            </span>
            <span className="font-medium">{generationSteps[currentStep]}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-edu-primary animate-shimmer"
              style={{ 
                width: `${progress}%`,
                backgroundImage: 'linear-gradient(90deg, rgba(45,114,178,1) 0%, rgba(59,172,182,1) 50%, rgba(45,114,178,1) 100%)',
                backgroundSize: '200% 100%'
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            {generationSteps.map((step, index) => (
              <span 
                key={index}
                className={`px-2 py-1 rounded-full ${
                  index <= currentStep 
                    ? 'bg-edu-light text-edu-dark' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index + 1}. {step.split('...')[0]}
              </span>
            ))}
          </div>
        </>
      )}
      
      {status === GenerationStatus.COMPLETED && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm font-medium text-green-500 flex items-center">
            <FileText size={16} className="mr-2" /> 
            Worksheet generated successfully!
          </p>
          <div className="flex gap-4 text-xs">
            <span className="bg-edu-light px-3 py-1 rounded-full flex items-center">
              <Clock size={14} className="mr-1" />
              Generated in {generationTime} seconds
            </span>
            <span className="bg-edu-light px-3 py-1 rounded-full flex items-center">
              <Database size={14} className="mr-1" />
              Based on {sourcesCount} sources
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;
