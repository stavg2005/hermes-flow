import { usePostFlow } from '@/hooks/UseFlowAPI';
import { PostFlowResponse } from '@/lib/FlowAPI';
import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { useCallback } from 'react';

export const usePostWrapper = () => {
  const postFlowMutation = usePostFlow();

  const PostFlowWrapper = useCallback(
    async (nodes: CustomNode[], edges: CustomEdge[]): Promise<void> => {
      const combined = { nodes, edges };
      const response: PostFlowResponse =
        await postFlowMutation.mutateAsync(combined);

      if (response.status !== 'sucsess') {
        throw new Error(`Flow validation failed: ${response.error}`);
      }
    },
    [postFlowMutation]
  );

  return {
    PostFlowWrapper,
    isValidating: postFlowMutation.isPending,
  };
};
