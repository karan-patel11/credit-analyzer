import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon } from '../../utils/icons';

const STAGES = [
  { id: 1, label: 'Parsing bank statement' },
  { id: 2, label: 'Analyzing cash flow' },
  { id: 3, label: 'Scoring risk factors' },
  { id: 4, label: 'Generating credit memo' },
];

const PipelineProgress = ({ isAnalyzing, onComplete, error }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(0);
      return;
    }

    let isMounted = true;

    const animatePipeline = async () => {
      // Stage 1
      if (!isMounted) return;
      setCurrentStage(1);
      await new Promise(r => setTimeout(r, 800));
      
      // Stage 2
      if (!isMounted) return;
      setCurrentStage(2);
      await new Promise(r => setTimeout(r, 1200));
      
      // Stage 3
      if (!isMounted) return;
      setCurrentStage(3);
      await new Promise(r => setTimeout(r, 1000));
      
      // Stage 4
      if (!isMounted) return;
      setCurrentStage(4);
      await new Promise(r => setTimeout(r, 800));

      // Complete
      if (!isMounted) return;
      setCurrentStage(5); // All complete
      
      // Short delay before showing results
      await new Promise(r => setTimeout(r, 400));
      if (isMounted) onComplete();
    };

    animatePipeline();

    return () => { isMounted = false; };
  }, [isAnalyzing, onComplete]);

  // If there's an error, we mark the current stage as failed
  const isFailed = !!error;

  return (
    <div className="flex flex-col h-full items-center justify-center py-10">
      <div className="relative w-full max-w-sm">
        {STAGES.map((stage, idx) => {
          const isPending = currentStage < stage.id && !isFailed;
          const isActive = currentStage === stage.id && !isFailed;
          const isCompleted = currentStage > stage.id && !isFailed;
          const isCurrentFailed = isFailed && currentStage === stage.id;

          return (
            <div key={stage.id} className="relative flex items-center h-[48px] group">
              {/* Vertical line connecting stages */}
              {idx < STAGES.length - 1 && (
                <div 
                  className={`absolute left-[11px] top-[32px] h-[32px] w-[2px] transition-colors-fast
                    ${isCompleted ? 'bg-[var(--status-approve)]' : 'bg-[var(--border-default)]'}`} 
                />
              )}

              {/* Status Circle */}
              <div className="relative z-10 shrink-0 mr-4">
                {isPending && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-hover)] bg-[var(--bg-primary)] text-[10px] font-mono-num text-[var(--text-tertiary)]">
                    {stage.id}
                  </div>
                )}
                
                {isActive && (
                  <div className="relative flex h-6 w-6 items-center justify-center">
                    <div className="absolute inset-0 animate-spin rounded-full border border-[var(--accent)] border-t-transparent"></div>
                    <div className="h-2 w-2 rounded-full bg-[var(--accent)]"></div>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="flex h-6 w-6 scale-110 items-center justify-center rounded-full bg-[var(--status-approve)] text-black transition-transform-spring">
                    <CheckIcon className="w-3.5 h-3.5" />
                  </div>
                )}

                {isCurrentFailed && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--status-decline)] text-white">
                    <XIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div 
                className={`text-[14px] font-medium transition-all-fast
                  ${isPending ? 'text-[var(--text-tertiary)]' : ''}
                  ${isActive ? 'translate-x-1 transform text-[var(--text-primary)]' : ''}
                  ${isCompleted ? 'text-[var(--text-secondary)]' : ''}
                  ${isCurrentFailed ? 'text-[var(--status-decline)]' : ''}
                `}
              >
                {stage.label}
              </div>

              {/* Pulse effect on active row */}
              {isActive && (
                <div className="absolute inset-0 -z-10 rounded-[12px] bg-[var(--accent-subtle)] animate-pulse-status"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {error && (
        <div className="mt-8 max-w-sm rounded-[12px] border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)] p-4 text-center text-[13px] text-[var(--status-decline)]">
          {error}
        </div>
      )}
    </div>
  );
};

export default PipelineProgress;
