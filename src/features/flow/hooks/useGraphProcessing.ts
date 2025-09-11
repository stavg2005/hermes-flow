import { useAppDispatch, useAppSelector } from '@/app/store';
import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { useEdges, useNodes } from '@xyflow/react';
import { useCallback } from 'react';
import { graphProcessingActions } from '../../../store/slices/graphProcessingSlice';
import { GraphProcessingService } from '../services/GraphProcessingService';
import { useAbortController } from './useAbortController';
//import { usePostWrapper } from './usePostFlow';

export const useGraphProcessing = () => {
  const dispatch = useAppDispatch();
  const nodes = useNodes();
  const edges = useEdges();
  const processingState = useAppSelector(state => state.graph);

  //const { PostFlowWrapper } = usePostWrapper();
  const { createController, abort, cleanup } = useAbortController();

  const handleNodeChange = useCallback(
    (nodeId: string) => {
      dispatch(graphProcessingActions.setCurrentNode(nodeId));
    },
    [dispatch]
  );

  const processGraph = useCallback(
    async (
      nodes: CustomNode[],
      edges: CustomEdge[],
      signal: AbortSignal
    ): Promise<void> => {
      // Validate graph structure
      GraphProcessingService.validateGraph(nodes, edges);

      // post flow via API
      //await PostFlowWrapper(nodes, edges);

      // Process file inputs concurrently
      await GraphProcessingService.processFileInputs(nodes, signal);

      // Execute main processing pipeline
      await GraphProcessingService.executeNodeProcessing(
        nodes,
        edges,
        signal,
        handleNodeChange
      );
    },
    [handleNodeChange]
  );

  const startProcessing = useCallback(async (): Promise<void> => {
    if (processingState.isProcessing) {
      throw new Error('Processing already in progress');
    }

    const abortController = createController();

    try {
      dispatch(graphProcessingActions.startProcessing());
      await processGraph(nodes, edges, abortController.signal);
      dispatch(graphProcessingActions.completeProcessing());
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        dispatch(graphProcessingActions.stopProcessing());
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        dispatch(graphProcessingActions.setError(errorMessage));
        throw error;
      }
    } finally {
      cleanup();
    }
  }, [
    dispatch,
    nodes,
    edges,
    processGraph,
    processingState.isProcessing,
    createController,
    cleanup,
  ]);

  const stopProcessing = useCallback(() => {
    abort();
  }, [abort]);

  return {
    ...processingState,
    startProcessing,
    stopProcessing,
  };
};
