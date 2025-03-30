
import React from 'react';
import { GenerationStatus } from '@/types/worksheet';

interface GenerationProgressProps {
  status: GenerationStatus;
  duration: number; // Estimated duration in seconds
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ status, duration }) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === GenerationStatus.GENERATING) {
      const startTime = Date.now();
      
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Calculate progress percentage (max 95% until complete)
        const calculatedProgress = Math.min(95, (elapsed / duration) * 100);
        setProgress(calculatedProgress);
      }, 100);
    } else if (status === GenerationStatus.COMPLETED) {
      setProgress(100);
    } else {
      setProgress(0);
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, duration]);

  if (status !== GenerationStatus.GENERATING && status !== GenerationStatus.COMPLETED) {
    return null;
  }

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Generating worksheet...</span>
        <span>{elapsedTime}s</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${status === GenerationStatus.COMPLETED ? 'bg-green-500' : 'bg-edu-primary animate-shimmer'}`}
          style={{ 
            width: `${progress}%`,
            backgroundImage: status === GenerationStatus.COMPLETED ? 'none' : 'linear-gradient(90deg, rgba(45,114,178,1) 0%, rgba(59,172,182,1) 50%, rgba(45,114,178,1) 100%)',
            backgroundSize: '200% 100%'
          }}
        />
      </div>
      {status === GenerationStatus.COMPLETED && (
        <p className="text-sm font-medium text-green-500">Worksheet generated successfully!</p>
      )}
    </div>
  );
};

export default GenerationProgress;
