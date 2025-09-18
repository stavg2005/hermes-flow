import { FC, useState } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import FileUploadModal from './FileUploadModal';
import Header from './Header';
import WorkflowGrid from './WorkflowGrid';

interface WorkflowBarProps {
  onClose: () => void;
}

const WorkflowBar: FC<WorkflowBarProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(1);
  const mock_workflows: string[] = ['Example 1', 'Example 2', 'Example 3'];
  const [workflows, setWorkflows] = useState<string[]>(mock_workflows);

  //basic for needs minio integraion
  const handleAddWorkflow = (workflowName: string, content: any) => {
    setWorkflows(prev => [...prev, workflowName]);
    console.log('Added workflow:', workflowName, 'with content:', content);
  };

  const handleDeleteWorkflow = (index: number) => {
    setWorkflows(prev => prev.filter((_, i) => i !== index));
    console.log('Deleted workflow at index:', index);
  };

  const {
    showFileUpload,
    fileInputRef,
    handleFileSelect,
    openFileExplorer,
    openUploadModal,
    closeUploadModal,
    processFile,
  } = useFileUpload(handleAddWorkflow);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='relative bg-[#1b333c]/90 backdrop-blur-md text-white p-6 md:p-8 rounded-3xl max-w-6xl w-full mx-4 min-h-[40vh] max-h-[90vh] overflow-auto'>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        <WorkflowGrid
          workflows={workflows}
          onAddWorkflow={openUploadModal}
          onDeleteWorkflow={handleDeleteWorkflow}
          isBlurred={showFileUpload}
        />

        <FileUploadModal
          isVisible={showFileUpload}
          onClose={closeUploadModal}
          onFileExplorerOpen={openFileExplorer}
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onFileProcess={processFile}
        />
      </div>
    </div>
  );
};
export default WorkflowBar;
