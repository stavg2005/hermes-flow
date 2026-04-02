import { useMixerData } from './hooks/useMixerData';
import { GetCurrentNodeId, useAppSelector } from '@/app/store';
import { type NodeProps } from '@xyflow/react';
import React from 'react';
import { MixerGrid } from './MixerGrid';
import { MixerHandle } from './MixerHandle';
const MixerNodeComponent: React.FC<NodeProps> = ({ id, isConnectable }) => {
  const currentProcessingNode = useAppSelector(GetCurrentNodeId);
  const receivedData = useMixerData(id);
  const isProcessing = currentProcessingNode === id;

  return (
    <div
      className={`
        relative animate-drop-in bg-zinc-800 rounded-3xl p-2 min-w-64 max-w-sm min-h-60 transition-all duration-200 border-4
        ${isProcessing ? 'border-white' : 'border-transparent'}
      `}
    >
      <MixerHandle
        type='target'
        position='left'
        isConnectable={isConnectable}
      />

      <MixerHandle
        type='source'
        position='right'
        isConnectable={isConnectable}
      />

      <div className='text-center'>
        <h3 className='text-white text-3xl font-bold italic font-inter mb-2'>
          mixer
        </h3>
      </div>

      <MixerGrid data={receivedData} />
    </div>
  );
};

export default MixerNodeComponent;
