import { GetCurrentNodeId, useAppSelector } from '@/app/store';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
import { Progress } from '../../../components/ui/progress';
import { DelayNodeData } from '../types/NodeData';
import DurationInput from './DurationInput';
import { useProgressTimer } from './hooks/useProgressTimer';

const DelayNodeComponent: React.FC<NodeProps> = ({ id, data }) => {
  const [duration, setDuration] = useState(5);
  const currentProcessingNode = useAppSelector(GetCurrentNodeId);
  const { updateNodeData } = useReactFlow();
  const isBeingProcessed = currentProcessingNode === id;

  const { progress } = useProgressTimer(isBeingProcessed, duration * 1000);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    updateNodeData(id, { delay: newDuration }); // Only store what matters
  };

  useEffect(() => {
    const formattedData = data as DelayNodeData;
    setDuration(formattedData.delay);
  }, [data]);

  return (
    <div
      className={`relative animate-drop-in bg-zinc-800 rounded-3xl p-4 min-w-64 max-w-xs min-h-24 transition-all duration-200 border-4 ${
        isBeingProcessed ? 'border-white' : 'border-transparent'
      }`}
    >
      <Handle
        type='target'
        id='delay-input'
        position={Position.Left}
        style={{
          left: '-15px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          background: '#60a5fa',
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
          background: '#60a5fa',
          borderRadius: '50%',
          boxShadow: '0 0 15px rgba(96, 165, 250, 0.6)',
          border: 'none',
        }}
      />

      <h3 className='text-white text-2xl font-bold italic font-sans leading-tight mb-2'>
        Delay
      </h3>
      <DurationInput
        duration={duration}
        onDurationChange={handleDurationChange}
      />

      <div className='flex items-center justify-between gap-1'>
        <div className='flex-1 py-2'>
          <Progress
            value={progress}
            className='h-6 bg-zinc-900 [&>div]:bg-blue-500 rounded-full'
          />
        </div>
      </div>
    </div>
  );
};
export default DelayNodeComponent;
