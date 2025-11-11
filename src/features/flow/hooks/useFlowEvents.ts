// useFlowHandlers.ts
import { GetIsRunning, useAppSelector } from '@/app/store';
import { NodeType } from '@/features/flow/types/connectionConfig';
import { createDefaultNodeData } from '@/features/nodes/types/nodeDataFactory';
import type { Connection, OnConnect } from '@xyflow/react';
import { addEdge, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getConnectionErrorMessage,
  isValidConnection,
} from '../services/ConnectionValidation';

export const useFlowHandlers = () => {
  const { setEdges, addNodes, getNodes, getEdges, screenToFlowPosition } =
    useReactFlow();
  const isProcessing = useAppSelector(GetIsRunning);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isProcessing) return;

      // Always validate against the latest graph from the instance
      const nodes = getNodes();
      const edges = getEdges();

      if (isValidConnection(connection, nodes, edges)) {
        setEdges(eds => addEdge(connection, eds));
        // No notifyFlowUpdate(): RF store change will re-trigger subscribers
      } else {
        const errorMessage = getConnectionErrorMessage(
          connection,
          nodes,
          edges
        );
        toast.error(errorMessage);
      }
    },
    [getNodes, getEdges, setEdges, isProcessing]
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
      if (isProcessing) return;

      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) {
        toast.error('No node type found');
        return;
      }

      // Guard against duplicates (use fresh nodes)
      const nodes = getNodes();
      if (nodeType === 'clients' && nodes.some(n => n.type === 'clients')) {
        toast.error('Client node already present');
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        const nodeData = createDefaultNodeData(nodeType as NodeType);
        addNodes({
          id: `${nodeType}-${Date.now()}`,
          type: nodeType as any,
          position,
          data: nodeData,
        });
        // No notifyFlowUpdate(): adding a node already updates the store
      } catch (error) {
        toast.error(`Error creating node: ${String(error)}`);
      }
    },
    [getNodes, screenToFlowPosition, addNodes, isProcessing]
  );

  return { onConnect, onDragOver, onDrop };
};
