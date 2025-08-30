import { Handle, NodeProps, Position } from '@xyflow/react';
import React from 'react';

const FileOptions: React.FC<NodeProps> = () => {
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
        <div className='flex items-center justify-between'>
          <span className='text-white font-medium italic'>Gain</span>
          <div className='bg-[#221C1C] rounded-full h-8 w-32 '></div>
        </div>

        {/* Option 2 */}
        <div className='flex items-center justify-between'>
          <span className='text-white font-medium italic'>Option 2</span>
          <div className='bg-[#221C1C] rounded-full h-8 w-32 '></div>
        </div>

        {/* Option 3 */}
        <div className='flex items-center justify-between'>
          <span className='text-white font-medium italic'>Option 3</span>
          <div className='bg-[#221C1C] rounded-full h-8 w-32 '></div>
        </div>
      </div>
    </div>
  );
};

export default FileOptions;
