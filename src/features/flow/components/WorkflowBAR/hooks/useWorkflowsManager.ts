import { useAppDispatch } from '@/app/store';
import { useFileOperations } from '@/features/flow/hooks/useFileOperations';
import { WorkflowBarActions } from '@/store/slices/WorkflowBarSlice';
import { useMinIOOperations } from './useMinIOOperations';

export const useFileManager = () => {
  const { loadGraph } = useFileOperations();
  const { isLoading, fetchFileMetadata, deleteFromMinIO, loadFileContent } =
    useMinIOOperations();
  const dispatch = useAppDispatch();
  const refreshFiles = async () => {
    try {
      const files = await fetchFileMetadata();
      dispatch(WorkflowBarActions.Setfiles(files));
    } catch (error) {
      console.error('Failed to refresh files:', error);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      await deleteFromMinIO(fileName, true);
      await refreshFiles();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleLoadWorkflow = async (fileName: string) => {
    try {
      const { content } = await loadFileContent(fileName);
      loadGraph(content);
      dispatch(WorkflowBarActions.CloseModel());
    } catch (error) {
      console.error('Load workflow failed:', error);
    }
  };

  return {
    isLoading,
    refreshFiles,
    handleDeleteFile,
    handleLoadWorkflow,
  };
};
