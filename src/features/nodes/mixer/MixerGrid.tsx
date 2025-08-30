import { FileInputNodeData } from '@/features/nodes/types/NodeData';
import { memo } from 'react';
import { EmptySlot, FileSquare, PlusButton } from './Slots';

interface MixerGridProps {
  data: FileInputNodeData[];
  maxSlots?: number;
}

export const MixerGrid = memo<MixerGridProps>(({ data, maxSlots = 3 }) => {
  const emptySlots = Math.max(0, maxSlots - data.length);

  return (
    <div className='grid grid-cols-2 gap-3 p-2'>
      {data.map(item => (
        <FileSquare
          key={item.filePath || item.fileName || Math.random()}
          item={item}
        />
      ))}

      {Array.from({ length: emptySlots }, (_, i) => (
        <EmptySlot key={`empty-${i}`} />
      ))}

      <PlusButton />
    </div>
  );
});

MixerGrid.displayName = 'MixerGrid';
