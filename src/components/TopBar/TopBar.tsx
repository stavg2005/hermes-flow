import { useGraphProcessing } from '@/hooks/graph/useGraphProcessing';
import { useProcessingNotifications } from '@/hooks/graph/useProcessingNotifications';
import { useFileOperations } from '@/hooks/useFileOperations';
import { Radio } from 'lucide-react';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { FileControls } from './FileControls';
import { ProcessingControls } from './ProcessingControls';

interface TopBarProps {
  onTransmit?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onTransmit }) => {
  const {
    isProcessing,
    currentNodeID,
    error,
    startProcessing,
    stopProcessing,
  } = useGraphProcessing();
  const { saveGraph, loadGraph, newGraph } = useFileOperations();

  // Handle notifications as a side effect
  useProcessingNotifications(isProcessing, error, currentNodeID);

  const handleRun = useCallback(async () => {
    console.log('in handle run');
    try {
      await startProcessing();
    } catch (error) {
      toast.error(`Processing failed: ${error}`);
    }
  }, [startProcessing]);

  return (
    <div className='fixed top-0 left-0 right-0 h-20 bg-transparent z-50 flex items-center px-6'>
      <div className='flex-1'></div>

      <div className='absolute left-1/2 transform -translate-x-1/2'>
        <FileControls onNew={newGraph} onSave={saveGraph} onLoad={loadGraph} />
      </div>

      <div className='flex items-center gap-3'>
        <ProcessingControls
          isProcessing={isProcessing}
          onStart={handleRun}
          onStop={stopProcessing}
        />

        <button
          onClick={onTransmit}
          className='flex items-center gap-2 px-4 py-2 bg-[#193643] hover:bg-[#214e62] text-white rounded-lg transition-colors text-sm font-medium border border-[#ecca93]'
        >
          <Radio className='w-4 h-4' />
          Preview
        </button>
      </div>
    </div>
  );
};

export default TopBar;
