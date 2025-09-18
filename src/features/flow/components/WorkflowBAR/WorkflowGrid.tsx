import { FC } from 'react';
import AddWorkflowButton from './AddWorkflowButton';
import WorkflowItem from './WorkflowItem';
interface WorkflowGridProps {
  workflows: string[];
  onAddWorkflow: () => void;
  onDeleteWorkflow: (index: number) => void;
  isBlurred: boolean;
}

interface WorkflowGridProps {
  workflows: string[];
  onAddWorkflow: () => void;
  onDeleteWorkflow: (index: number) => void;
  isBlurred: boolean;
  loading?: boolean;
}

const WorkflowGrid: FC<WorkflowGridProps> = ({
  workflows,
  onAddWorkflow,
  onDeleteWorkflow,
  isBlurred,
  loading = false,
}) => (
  <div
    className={`grid grid-cols-3 gap-4 md:gap-6 ${isBlurred ? 'filter blur-sm' : ''}`}
  >
    {loading && workflows.length === 0 ? (
      <div className='col-span-3 text-center py-8'>
        <span className='text-gray-400'>Loading workflows from MinIO...</span>
      </div>
    ) : (
      <>
        {workflows.map((workflow, index) => (
          <WorkflowItem
            key={workflow}
            workflow={workflow}
            index={index}
            onDelete={onDeleteWorkflow}
          />
        ))}
        <AddWorkflowButton onAddClick={onAddWorkflow} />
      </>
    )}
  </div>
);

export default WorkflowGrid;
