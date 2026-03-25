import { useAppDispatch, useAppSelector } from '@/app/store';
import { ClientData } from '@/features/nodes/types/NodeData';
import { FlowAPI } from '@/lib/FlowAPI';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { GraphTraversalService } from '../services/GraphTraversalService';
import { ExecutionMode, RunRequest, useLiveSession } from './useLiveSession';

export const useGraphRunner = () => {
  const dispatch = useAppDispatch();
  const { getNodes, getEdges } = useReactFlow();

  const { startSession, audioStream } = useLiveSession();

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

      if (mode !== 'preview') {
        const clients = nodes.find(node => node.type === 'clients');
        if (!clients) {
          toast.error('No clients found');
          return;
        }
        const clientsArray = (clients.data?.clients as ClientData[]) || null;
        if (!clientsArray || clientsArray.length === 0) {
          toast.error('Clients have no data');
          return;
        }
        for (const client of clientsArray) {
          if (!client.ip.length || !client.port.length) {
            toast.error('One or more clients are missing data');
            return;
          }
        }
      }

      // --- SANITIZE PAYLOAD FOR THE C++ SERVER ---
      // Strip out React Flow UI data (position, styles, selected, etc.)
      const sanitizedNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        data: node.data,
      }));

      const sanitizedEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
      }));

      const sanitizedStartNode = {
        id: startNode.id,
        type: startNode.type,
        data: startNode.data,
      };

      const payload: RunRequest = {
        flow: {
          start_node: sanitizedStartNode,
          nodes: sanitizedNodes,
          edges: sanitizedEdges,
        },
      };

      try {
        dispatch(graphProcessingActions.startProcessing());
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
        await FlowAPI.stopSession(activeSessionId);
      } catch (err) {
        toast.error(`Failed to stop session on server: ${err}`);
      }
      dispatch(graphProcessingActions.setJanusMount(null));
    }
    dispatch(graphProcessingActions.stopProcessing());
  }, [dispatch, activeSessionId]);

  const pauseWorkflow = useCallback(async () => {
    if (activeSessionId) {
      try {
        await FlowAPI.pauseSession(activeSessionId);
      } catch (err) {
        toast.error(`Failed to pause session: ${err}`);
      }
    }
  }, [activeSessionId]);

  const resumeWorkflow = useCallback(async () => {
    if (activeSessionId) {
      try {
        await FlowAPI.resumeSession(activeSessionId);
      } catch (err) {
        toast.error(`Failed to resume session: ${err}`);
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
    audioStream,
  };
};
