import { useAppDispatch, useAppSelector } from '@/app/store';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { useReactFlow } from '@xyflow/react';
import axios from 'axios';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { GraphTraversalService } from '../services/GraphTraversalService';
import { ExecutionMode, RunRequest, useLiveSession } from './useLiveSession';

export const useGraphRunner = () => {
  const dispatch = useAppDispatch();
  const { getNodes, getEdges } = useReactFlow();
  const { startSession } = useLiveSession();
  const activeSessionId = useAppSelector(state => state.graph.activeSessionId);
  const isProcessing = useAppSelector(s => s.graph.isProcessing);

  const executeGraph = useCallback(
    async (mode: ExecutionMode) => {
      if (isProcessing) return;

      const nodes = getNodes();
      const edges = getEdges();
      const startNode = GraphTraversalService.findStartNode(nodes, edges);

      if (!startNode) {
        toast.error('No valid start node found (Input, Mixer, or Delay)');
        return;
      }

      const payload: RunRequest = {
        flow: {
          start_node: startNode,
          nodes,
          edges,
        },
      };

      try {
        dispatch(graphProcessingActions.startProcessing());
        // Pass the mode down to useLiveSession
        await startSession(payload, mode);
      } catch (err) {
        console.error(err);
        toast.error('Failed to start engine');
        dispatch(graphProcessingActions.setError(String(err)));
      }
    },
    [dispatch, getNodes, getEdges, isProcessing, startSession]
  );

  const runWorkflow = useCallback(
    () => executeGraph('transmit'),
    [executeGraph]
  );
  const previewWorkflow = useCallback(
    () => executeGraph('preview'),
    [executeGraph]
  );

  const stopWorkflow = useCallback(async () => {
    if (activeSessionId) {
      try {
        await axios.post(`http://localhost:5000/stop/?id=${activeSessionId}`);
      } catch (err) {
        toast.error(`Failed to stop session on server:${err}`);
      }
    }
    dispatch(graphProcessingActions.stopProcessing());
  }, [dispatch, activeSessionId]);

  const pauseWorkflow = useCallback(async () => {
    if (activeSessionId) {
      try {
        await axios.post(`http://localhost:5000/pause/?id=${activeSessionId}`);
      } catch (err) {
        toast.error(`failed to pause session: ${err}`);
      }
    }
  }, [activeSessionId]);

  const resumeWorkflow = useCallback(async () => {
    if (activeSessionId) {
      try {
        await axios.post(`http://localhost:5000/resume/?id=${activeSessionId}`);
      } catch (err) {
        toast.error(`failed to resume session: ${err}`);
      }
    }
  }, [activeSessionId]);
  return {
    runWorkflow,
    stopWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    isProcessing,
    previewWorkflow,
  };
};
