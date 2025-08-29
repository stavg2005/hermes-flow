import { useMixerData } from '@/hooks/nodesHooks/useMixerData';
import { GetProccecedNodeID, useAppSelector } from '@/store/store';
import { type NodeProps } from '@xyflow/react';
import React from 'react';
import { MixerGrid } from './MixerGrid';
import { MixerHandle } from './MixerHandle';
const MixerNodeComponent: React.FC<NodeProps> = ({ id, isConnectable }) => {
  const currentProcessingNode = useAppSelector(GetProccecedNodeID);
  const receivedData = useMixerData(id);
  const isProcessing = currentProcessingNode === id;

  return (
    <div
      className={`
        relative bg-[#373333] rounded-3xl p-2 min-w-[230px] min-h-[245px] transition-all duration-200
        ${isProcessing ? 'border-4 border-white' : ''}
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
        <h3 className='text-white text-[28px] font-bold italic font-inter'>
          mixer
        </h3>
      </div>

      <MixerGrid data={receivedData} />
    </div>
  );
};

export default MixerNodeComponent;
