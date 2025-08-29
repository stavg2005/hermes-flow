import { GetProccecedNodeID, useAppSelector } from '@/store/store';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';

import React, { useState } from 'react';
import { Progress } from '../../ui/progress';
import DurationInput from './DurationInput';
const DelayNodeComponent: React.FC<NodeProps> = ({ id }) => {
  const [duration, setDuration] = useState(250);
  const currentProcessingNode = useAppSelector(GetProccecedNodeID);
  const { updateNodeData } = useReactFlow();

  const isBeingProcessed = currentProcessingNode === id;

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    updateNodeData(id, { duration: newDuration }); // Only store what matters
  };

  return (
    <div
      className={`relative bg-[#373333] rounded-3xl p-4 min-w-[230px] min-h-[96px] transition-all duration-200  ${
        isBeingProcessed ? 'border-4 border-white' : ''
      }`}
    >
      <Handle
        type='target'
        id='delay-input'
        position={Position.Left}
        style={{
          left: '-5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          background: '#709DFF',
          borderRadius: '50%',
          border: 'none',
        }}
      />

      <Handle
        type='source'
        id='delay-output'
        position={Position.Right}
        style={{
          right: '-5px',
          top: '70px',
          width: '24px',
          height: '24px',
          background: '#709DFF',
          borderRadius: '50%',
          boxShadow: '0 0 15px rgba(112, 157, 255, 0.6)',
          border: 'none',
        }}
      />

      <h3 className='text-white text-[24px] font-bold italic font-sans leading-tight'>
        Delay
      </h3>
      <DurationInput
        duration={duration}
        onDurationChange={handleDurationChange}
      />

      <div className='flex items-center justify-between gap-1'>
        <div className='flex-1'>
          <Progress
            value={50}
            className='h-8 bg-[#221C1C] [&>div]:bg-[#193643]'
          />
        </div>
      </div>
    </div>
  );
};
export default DelayNodeComponent;
