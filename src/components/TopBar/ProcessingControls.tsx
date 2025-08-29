import { Play, Square } from 'lucide-react';
import React from 'react';

interface ProcessingControlsProps {
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  isProcessing,
  onStart,
  onStop,
}) => {
  const buttonClass =
    'flex items-center gap-2 px-4 py-2 bg-[#193643] hover:bg-[#214e62] text-white rounded-lg transition-colors text-sm font-medium border border-[#ecca93]';

  if (isProcessing) {
    return (
      <button onClick={onStop} className={buttonClass}>
        <Square className='w-4 h-4 fill-current' />
        Stop
      </button>
    );
  }

  return (
    <button onClick={onStart} className={buttonClass}>
      <Play className='w-4 h-4 fill-current' />
      Run
    </button>
  );
};
