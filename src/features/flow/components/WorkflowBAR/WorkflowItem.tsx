import { FC, useState } from 'react';

interface WorkflowItemProps {
  workflow: string;
  index: number;
  onDelete: (index: number) => void;
}

const WorkflowItem: FC<WorkflowItemProps> = ({ workflow, index, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleLoadWorkflow = async () => {
    setLoading(true);
    try {
      // Fetch directly from MinIO
      //const workflowData = await minioService.getWorkflow(workflow);
      // Convert to File object for loadGraph
      //const jsonString = JSON.stringify(workflowData);
      //const blob = new Blob([jsonString], { type: 'application/json' });
      //const file = new File([blob], `${workflow}.json`, {
      //type: 'application/json',
      //});
      //loadGraph(file);
    } catch (error) {
      console.error(`Error loading workflow ${workflow}:`, error);
      alert(`Failed to load workflow: ${workflow}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center group'>
      <div
        className={`relative bg-[#433e3e] rounded-lg p-4 h-32 md:h-44 w-full flex items-center justify-center hover:bg-slate-600 transition-colors cursor-pointer ${
          loading ? 'opacity-50' : ''
        }`}
        onClick={handleLoadWorkflow}
      >
        {loading ? (
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
            onDelete(index);
          }}
          className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'
          aria-label={`Delete ${workflow}`}
          type='button'
        >
          ✕
        </button>
      </div>
      <p className='text-xs md:text-sm font-medium italic text-white mt-2 text-center'>
        {workflow}
      </p>
    </div>
  );
};

export default WorkflowItem;
