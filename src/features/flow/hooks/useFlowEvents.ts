// Updated useFlowHandlers with debugging
import { GetIsRunning, useAppSelector } from '@/app/store';
import { NodeType } from '@/features/flow/types/connectionConfig';
import { createDefaultNodeData } from '@/features/nodes/types/nodeDataFactory';
import type { Connection, OnConnect } from '@xyflow/react';
import { addEdge, useEdges, useNodes, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getConnectionErrorMessage,
  isValidConnection,
} from '../services/ConnectionValidation.ts';

export const useFlowHandlers = () => {
  const reactFlowInstance = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();
  const { setEdges, addNodes } = useReactFlow();
  const isProcessing = useAppSelector(GetIsRunning);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isProcessing) return;

      console.log('Connecting:', nodes);

      if (isValidConnection(connection, nodes, edges)) {
        setEdges(eds => addEdge(connection, eds));
      } else {
        const errorMessage = getConnectionErrorMessage(
          connection,
          nodes,
          edges
        );
        toast.error(errorMessage);
      }
    },
    [setEdges, nodes, edges, isProcessing]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (isProcessing) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [isProcessing]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (isProcessing) {
        return;
      }

      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (!nodeType) {
        toast.error('No node type found');
        return;
      }

      if (!reactFlowInstance) {
        toast.error('Flow instance not available');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        const nodeData = createDefaultNodeData(nodeType as NodeType);

        const newNode = {
          id: `${nodeType}-${Date.now()}`,
          type: nodeType,
          position,
          data: nodeData,
        };

        addNodes(newNode);
      } catch (error) {
        toast.error(`Error creating node: ${error}`);
      }
    },
    [reactFlowInstance, addNodes, isProcessing]
  );

  return {
    onConnect,
    onDragOver,
    onDrop,
  };
};
