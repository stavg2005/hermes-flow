import { Pause, Play, Radio, Square } from 'lucide-react';
import React, { useState } from 'react';

//TODO THIS FEELS LIKE TO MUCH
interface ProcessingControlsProps {
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onPreview: () => void;
}

export const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  isProcessing,
  onStart,
  onStop,
  onPause,
  onResume,
  onPreview,
}) => {
  // Local UI state to toggle between Pause and Resume
  const [isPaused, setIsPaused] = useState(false);

  const buttonClass =
    'flex items-center gap-2 px-4 py-2 bg-[#193643] hover:bg-[#214e62] text-white rounded-lg transition-colors text-sm font-medium border border-[#ecca93]';

  if (isProcessing) {
    return (
      <div className='flex items-center gap-3'>
        <button
          onClick={() => {
            if (isPaused) {
              onResume();
            } else {
              onPause();
            }
            setIsPaused(!isPaused);
          }}
          className={buttonClass}
        >
          {isPaused ? (
            <Play className='w-4 h-4 fill-current' />
          ) : (
            <Pause className='w-4 h-4 fill-current' />
          )}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={() => {
            setIsPaused(false);
            onStop();
          }}
          className={buttonClass}
        >
          <Square className='w-4 h-4 fill-current' />
          Stop
        </button>
      </div>
    );
  }

  return (
    <div className='flex gap-2'>
      <button onClick={onPreview} className={buttonClass}>
        <Play className='w-4 h-4 fill-current' />
        Preview
      </button>

      <button onClick={onStart} className={buttonClass}>
        <Radio className='w-4 h-4 fill-current' />
        Transmit
      </button>
    </div>
  );
};
