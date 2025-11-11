// useFileManager.ts
import { useAppDispatch } from '@/app/store';
import { useDeleteWorkflowMutation } from '@/hooks/UseFlowAPI';
import { WorkflowBarActions } from '@/store/slices/WorkflowBarSlice';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useFileOperations } from '../../../hooks/useFileOperations';
import { useMinIOOperations } from './useMinIOOperations';

const wfKey = (name: string) => ['workflow-file', name] as const;
const listKey = ['json-files'] as const;

export const useFileManager = () => {
  const dispatch = useAppDispatch();
  const { loadGraph } = useFileOperations();
  const { loadFileContent } = useMinIOOperations();
  const deleteMutation = useDeleteWorkflowMutation();
  const qc = useQueryClient();

  const handleDeleteFile = async (fileName: string) => {
    try {
      await deleteMutation.mutateAsync(fileName);
      // Refresh the list and drop any cached content for that file
      qc.invalidateQueries({ queryKey: listKey });
      qc.removeQueries({ queryKey: wfKey(fileName) });
      toast.success(`Deleted ${fileName}`);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Delete failed');
    }
  };

  const handleLoadWorkflow = async (fileName: string) => {
    try {
      // Imperative fetch that also caches by key
      const data = await qc.fetchQuery({
        queryKey: wfKey(fileName),
        queryFn: () => loadFileContent(fileName),
        staleTime: 60_000,
      });

      loadGraph(data.content);
      dispatch(WorkflowBarActions.CloseModel());
      toast.success(`Loaded ${data.workflowName}`);
    } catch (err) {
      console.error('Load workflow failed:', err);
      toast.error('Failed to load workflow');
    }
  };

  return {
    isLoading: deleteMutation.isPending, // or combine with some local state if you want
    handleDeleteFile,
    handleLoadWorkflow,
  };
};
