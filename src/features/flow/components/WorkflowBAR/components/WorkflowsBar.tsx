// WorkflowBar.tsx
import { FC, useState } from 'react';
import { useJsonFilesQuery } from '@/hooks/UseFlowAPI';
import { useFileManager } from '../hooks/useWorkflowsManager';
import FileUploadModal from './FileUploadModal';
import Header from './Header';
import WorkflowGrid from './WorkflowGrid';

interface WorkflowBarProps {
  onClose: () => void;
}

const WorkflowBar: FC<WorkflowBarProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  // React Query owns the list (no Redux flags, no manual refresh here)
  const { data: files = [], isFetching } = useJsonFilesQuery();

  // Imperative actions (delete, optional load)
  const { handleDeleteFile /*, handleLoadWorkflow*/ } = useFileManager();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='relative bg-[#1b333c]/90 backdrop-blur-md text-white p-6 md:p-8 rounded-3xl max-w-6xl w-full mx-4 min-h-[40vh] max-h-[90vh] overflow-auto'>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        <WorkflowGrid
          workflows={files}
          loading={isFetching} // <- show skeleton/spinner as you like
          onAddWorkflow={() => setIsVisible(true)} // <- no refetch on open
          onDeleteWorkflow={handleDeleteFile} // <- mutation invalidates the list
          isBlurred={isVisible}
          // onLoadWorkflow={(name) => handleLoadWorkflow(name)} // if you expose loading
        />

        <FileUploadModal
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </div>
    </div>
  );
};

export default WorkflowBar;
