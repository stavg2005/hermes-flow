import { FC } from 'react';
import { FileMetadata } from '../hooks/useMinIOOperations';
import { useFileManager } from '../hooks/useWorkflowsManager';
interface WorkflowItemProps {
  workflow: FileMetadata;
  index: number;
  onDelete: (filename: string) => void;
}

const WorkflowItem: FC<WorkflowItemProps> = ({ workflow, onDelete }) => {
  const { isLoading, handleLoadWorkflow } = useFileManager();

  return (
    <div className='flex flex-col items-center group'>
      <div
        className={`relative bg-[#433e3e] rounded-lg p-4 h-32 md:h-44 w-full flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer ${
          isLoading ? 'opacity-50' : ''
        }`}
        onClick={() => handleLoadWorkflow(workflow.fileName)}
      >
        {isLoading ? (
          <span className='text-xs md:text-sm text-gray-300'>Loading...</span>
        ) : (
          <span className='text-xs md:text-sm text-gray-300'>
            Workflow Content
          </span>
        )}

        {/* Delete button */}
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(workflow.fileName);
          }}
          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'
          aria-label={`Delete ${workflow}`}
          type='button'
        >
          ✕
        </button>
      </div>
      <p className='text-xs md:text-sm font-medium italic text-white mt-2 text-center'>
        {workflow.fileName}
      </p>
    </div>
  );
};

export default WorkflowItem;
