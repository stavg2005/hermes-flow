import { Handle, NodeProps, Position } from '@xyflow/react';
import React from 'react';
import { KeyboardEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';
const FileOptions: React.FC<NodeProps> = ({ id }) => {

  const handleOptionsChange = (gain: number) => {
    setGain(gain);
    updateNodeData(id, { gain: gain })
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value > 0) {
        handleOptionsChange(value);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const { updateNodeData } = useReactFlow();
  const [gain, setGain] = useState(1);
  return (
    <div className='bg-[#373333] rounded-3xl p-4 min-w-[200px] '>
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
          background: '#709DFF',
          borderRadius: '50%',
          border: 'none',
        }}
      />
      {/* Header */}
      <div className='mb-4'>
        <h3 className='text-white text-lg font-bold italic'>File options</h3>
      </div>

      {/* Option rows */}
      <div className='space-y-3'>
        {/* Gain */}
        <div className='flex flex-row'>
          <p className='text-white text-[16px] font-bold italic font-sans opacity-90'>
            gain:
          </p>
          <div className='w-26 h-8 bg-[#2a2626] rounded-full relative overflow-hidden cursor-pointer ml-27'>
            <input
              className='w-full h-full bg-transparent text-white text-[16px] font-bold italic font-sans opacity-90 px-5 border-none outline-none rounded-full'
              onKeyDown={handleKeyPress}
              onMouseDown={e => e.stopPropagation()}
              placeholder={gain.toString()}
            />
          </div>
        </div>

        {/* Option 2 */}
        <div className='space-y-3'>
          {/* Gain */}
          <div className='flex flex-row'>
            <p className='text-white text-[16px] font-bold italic font-sans opacity-90'>
              option 2:
            </p>
            <div className='w-26 h-8 bg-[#2a2626] rounded-full relative overflow-hidden cursor-pointer ml-20'>
              <input
                className='w-full h-full bg-transparent text-white text-[16px] font-bold italic font-sans opacity-90 px-5 border-none outline-none rounded-full'
                onMouseDown={e => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Option 3 */}
          <div className='space-y-3'>

            <div className='flex flex-row'>
              <p className='text-white text-[16px] font-bold italic font-sans opacity-90'>
                option 3:
              </p>
              <div className='w-26 h-8 bg-[#2a2626] rounded-full relative overflow-hidden cursor-pointer ml-20'>
                <input
                  className='w-full h-full bg-transparent text-white text-[16px] font-bold italic font-sans opacity-90 px-5 border-none outline-none rounded-full'
                  onMouseDown={e => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileOptions;
