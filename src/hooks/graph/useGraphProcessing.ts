import { CustomEdge, CustomNode } from '@/types/types';
import { useCallback, useRef } from 'react';
import { GraphTraversalService } from '../../services/GraphTraversalService';
import { ProcessorRegistry } from '../../services/ProcessorRegistry';
import { graphProcessingActions } from '../../store/slices/graphProcessingSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';

export const useGraphProcessing = () => {
  const dispatch = useAppDispatch();
  const { nodes, edges } = useAppSelector(state => state.flow);
  const processingState = useAppSelector(state => state.graph);

  const abortControllerRef = useRef<AbortController | null>(null);

  const processGraph = useCallback(
    async (
      nodes: CustomNode[],
      edges: CustomEdge[],
      signal: AbortSignal
    ): Promise<void> => {
      const startNode = GraphTraversalService.findStartNode(nodes, edges);
      if (!startNode) {
        throw new Error('No start node found');
      }

      let currentNodeId: string | null = startNode.id;

      while (currentNodeId && !signal.aborted) {
        dispatch(graphProcessingActions.setCurrentNode(currentNodeId));

        const node = nodes.find(n => n.id === currentNodeId);
        if (!node) break;

        try {
          await ProcessorRegistry.executeProcess(
            node.type as string,
            node.id,
            node.data,
            signal
          );
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw error; // Re-throw abort errors
          }
          throw new Error(`Processing failed at node ${node.id}: ${error}`);
        }

        currentNodeId = GraphTraversalService.getNextNode(currentNodeId, edges);
      }
    },
    [dispatch]
  );

  const startProcessing = useCallback(async (): Promise<void> => {
    if (processingState.isProcessing) {
      throw new Error('Processing already in progress');
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [dispatch, nodes, edges, processGraph, processingState.isProcessing]);

  const stopProcessing = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    ...processingState,
    startProcessing,
    stopProcessing,
  };
};
