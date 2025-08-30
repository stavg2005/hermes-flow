import { FileInputNodeData } from '@/features/nodes/types/NodeData';
import { memo } from 'react';

export const EmptySlot = memo(() => (
  <div className='bg-[#433E3E] rounded-2xl aspect-square relative overflow-hidden group cursor-pointer hover:bg-gray-500 transition-colors'>
    <div className='absolute inset-0 bg-gradient-to-br from-gray-500/20 to-transparent' />
    <div className='absolute inset-0 flex items-center justify-center'>
      <span className='text-gray-500 text-xs'>File Input</span>
    </div>
  </div>
));

EmptySlot.displayName = 'EmptySlot';

interface FileSquareProps {
  item: FileInputNodeData;
}

export const FileSquare = memo<FileSquareProps>(({ item }) => (
  // This component only re-renders when 'item' actually changes
  // If parent re-renders but 'item' is the same, this component stays as-is
  <div className='bg-[#433E3E] rounded-2xl aspect-square relative overflow-hidden group cursor-pointer hover:bg-gray-500 transition-colors'>
    <div className='absolute inset-0 bg-gradient-to-br from-gray-500/20 to-transparent'>
      <div className='flex items-center justify-center gap-1.5 h-16 w-20 mx-auto mt-1'>
        <div className='bg-white rounded-full w-3 h-7 animate-pop-in-1' />
        <div className='bg-white rounded-full w-3 h-10 animate-pop-in-2' />
        <div className='bg-white rounded-full w-3 h-7 animate-pop-in-3' />
      </div>
      <p className='text-white text-center -mt-2 font-bold italic font-inter text-xs truncate px-1'>
        {item.fileName || 'Unknown File'}
      </p>
      <div
        className='absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full'
        title='File Input'
      />
    </div>
  </div>
));

export const PlusButton = memo(() => (
  <div
    className='bg-[#433E3E] rounded-2xl aspect-square relative overflow-hidden group cursor-pointer hover:bg-gray-500 transition-colors flex items-center justify-center'
    title='Connect File Input'
  >
    <div className='absolute inset-0 bg-gradient-to-br from-gray-500/20 to-transparent' />
    <svg
      className='w-8 h-8 text-gray-400 group-hover:text-white transition-colors relative z-10'
      fill='none'
      stroke='currentColor'
      viewBox='0 0 24 24'
      strokeWidth={3}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 4.5v15m7.5-7.5h-15'
      />
    </svg>
  </div>
));
