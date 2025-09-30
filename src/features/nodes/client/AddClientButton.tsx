import { Plus } from 'lucide-react';
import { memo } from 'react';
export const AddClientButton = memo<{ onClick: () => void; disabled: boolean }>(
  ({ onClick, disabled }) => (
    <button
      onClick={onClick}
      className='p-2 rounded-lg border-2 border-gray-500 hover:border-gray-400 cursor-pointer transition-all duration-200 hover:bg-gray-600/20'
      disabled={disabled}
    >
      <Plus />
    </button>
  )
);
