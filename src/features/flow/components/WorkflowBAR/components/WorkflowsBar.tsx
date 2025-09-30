import {
  selectDataFetched,
  selectFilesMetaData,
  useAppDispatch,
} from '@/app/store';
import { WorkflowBarActions } from '@/store/slices/WorkflowBarSlice';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFileManager } from '../hooks/useWorkflowsManager';
import FileUploadModal from './FileUploadModal';
import Header from './Header';
import WorkflowGrid from './WorkflowGrid';
interface WorkflowBarProps {
  onClose: () => void;
}

const WorkflowBar: FC<WorkflowBarProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(1);
  const minioFiles = useSelector(selectFilesMetaData);
  const dataFetched = useSelector(selectDataFetched);
  const dispatch = useAppDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const { handleDeleteFile, refreshFiles } = useFileManager();

  useEffect(() => {
    if (!dataFetched) {
      refreshFiles();
      dispatch(WorkflowBarActions.setDataFetched(true));
    }
  }, [dataFetched, dispatch, refreshFiles]);
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
      <div className='relative bg-[#1b333c]/90 backdrop-blur-md text-white p-6 md:p-8 rounded-3xl max-w-6xl w-full mx-4 min-h-[40vh] max-h-[90vh] overflow-auto'>
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        <WorkflowGrid
          workflows={minioFiles}
          onAddWorkflow={() => {
            setIsVisible(true);
          }}
          onDeleteWorkflow={handleDeleteFile}
          isBlurred={isVisible}
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
