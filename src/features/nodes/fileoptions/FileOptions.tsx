import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react';
import React, { KeyboardEvent, useState } from 'react';
const FileOptions: React.FC<NodeProps> = ({ id, data }) => {
  const handleOptionsChange = (gain: number, pitch_shift: number) => {
    setGain(gain);
    setPitchShift(pitch_shift);
    updateNodeData(id, { gain: gain, pitch_shift: pitch_shift });
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    field: 'gain' | 'pitch_shift'
  ) => {
    if (e.key === 'Enter') {
      const value = Number((e.target as HTMLInputElement).value);

      if (!isNaN(value)) {
        if (field === 'gain' && value >= 0) {
          handleOptionsChange(value, pitch_shift);
          (e.target as HTMLInputElement).value = '';
        } else if (field === 'pitch_shift') {
          handleOptionsChange(gain, value);
          (e.target as HTMLInputElement).value = '';
        }
      }
    }
  };

  const { updateNodeData } = useReactFlow();
  const [gain, setGain] = useState(1.0);
  const [pitch_shift, setPitchShift] = useState(1.0);
  return (
    <div className='bg-zinc-800 rounded-3xl p-4 min-w-64 max-w-xs shadow-xl animate-drop-in'>
      <Handle
        id='options-output'
        type='source'
        position={Position.Right}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          background: '#60a5fa',
          borderRadius: '50%',
          border: 'none',
        }}
      />
      {/* Header */}
      <div className='mb-4'>
        <h3 className='text-white text-lg font-bold italic'>File options</h3>
      </div>

      {/* Option rows */}
      <div className='space-y-4'>
        {/* Gain */}
        <div className='flex flex-row items-center justify-between gap-4'>
          <p className='text-white text-base font-bold italic font-sans opacity-90 whitespace-nowrap'>
            gain:
          </p>
          <div className='w-24 h-8 bg-zinc-900/60 focus-within:bg-zinc-900 rounded-full relative overflow-hidden cursor-pointer transition-colors border border-transparent focus-within:border-blue-400/50'>
            <input
              type='number'
              className='w-full h-full bg-transparent text-white text-base font-bold italic font-sans opacity-90 px-4 border-none outline-none rounded-full text-center hover:bg-zinc-800/30'
              onKeyDown={e => handleKeyPress(e, 'gain')}
              onMouseDown={e => e.stopPropagation()}
              placeholder={data?.gain?.toString() || '1'}
            />
          </div>
        </div>

        {/* Pitch shift */}
        <div className='flex flex-row items-center justify-between gap-4'>
          <p className='text-white text-base font-bold italic font-sans opacity-90 whitespace-nowrap'>
            pitch shift:
          </p>
          <div className='w-24 h-8 bg-zinc-900/60 focus-within:bg-zinc-900 rounded-full relative overflow-hidden cursor-pointer transition-colors border border-transparent focus-within:border-blue-400/50'>
            <input
              type='number'
              className='w-full h-full bg-transparent text-white text-base font-bold italic font-sans opacity-90 px-4 border-none outline-none rounded-full text-center hover:bg-zinc-800/30'
              onKeyDown={e => handleKeyPress(e, 'pitch_shift')}
              onMouseDown={e => e.stopPropagation()}
              placeholder={data?.pitch_shift?.toString() || '1'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileOptions;
