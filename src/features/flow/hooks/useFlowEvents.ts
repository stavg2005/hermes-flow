import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import type {
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  NodeChange,
  EdgeChange
} from '@xyflow/react'
import { toast } from 'react-toastify'; // or whatever toast library you use
import { flowActions } from '@/store/slices/flowSlice';
import { createDefaultNodeData } from '@/features/nodes/types/nodeDataFactory';
import { NodeType } from '@/features/flow/types/connectionConfig';
import { GetIsRunning, selectEdges, selectNodes, useAppDispatch, useAppSelector } from '@/app/store';
import { isValidConnection, getConnectionErrorMessage } from '../services/ConnectionValidation.ts';

export const useFlowHandlers = () => {
  const reactFlowInstance = useReactFlow();
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const isProcessing = useAppSelector(GetIsRunning);
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!isProcessing) {
        dispatch(flowActions.applyNodeChanges(changes));
      }
    },
    [dispatch, isProcessing]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!isProcessing) {
        dispatch(flowActions.applyEdgeChanges(changes));
      }
    },
    [dispatch, isProcessing]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isProcessing) return;
      console.log(nodes);
      if (isValidConnection(connection, nodes, edges)) {
        dispatch(flowActions.addEdge(connection));
      } else {
        const errorMessage = getConnectionErrorMessage(connection, nodes, edges);
        toast.error(errorMessage);
      }
    },
    [dispatch, nodes, edges, isProcessing, isValidConnection, getConnectionErrorMessage]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (isProcessing) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, [isProcessing]);


  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (isProcessing) return;
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (!nodeType || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeData = createDefaultNodeData(nodeType as NodeType);

      dispatch(
        flowActions.addNode({
          type: nodeType,
          position,
          data: nodeData,
        })
      );
    },
    [reactFlowInstance, dispatch, isProcessing]
  );

  return {
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDragOver,
    onDrop
  };
};


