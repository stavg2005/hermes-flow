import { FC } from 'react';
import { Plus } from 'lucide-react';
interface AddWorkflowButtonProps {
  onAddClick: () => void;
}

const AddWorkflowButton: FC<AddWorkflowButtonProps> = ({ onAddClick }) => (
  <div className='flex flex-col items-center'>
    <button
      onClick={onAddClick}
      className='bg-[#433e3e] rounded-lg h-32 md:h-44 w-full flex items-center justify-center hover:bg-slate-500 transition-colors'
    >
      <Plus className='w-12 h-12 md:w-24 md:h-24 text-white' />
    </button>
    <p className='text-xs md:text-sm font-medium italic text-white mt-2 text-center'>
      Add New
    </p>
  </div>
);
export default AddWorkflowButton;
