import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { Connection } from '@xyflow/react';
import { ConnectionValidator } from './ConnectionValidator.ts';

const validator = new ConnectionValidator();

export const validateConnection = (
  connection: Connection,
  nodes: CustomNode[],
  edges: CustomEdge[]
) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  if (!sourceNode || !targetNode) {
    return {
      isValid: false,
      errorType: 'INVALID_NODES' as const,
      message: 'Could not find source or target node',
    };
  }

  const context = {
    connection,
    sourceNode,
    targetNode,
    existingEdges: edges,
    allNodes: nodes,
  };

  return validator.validate(context);
};

export const isValidConnection = (
  connection: Connection,
  nodes: CustomNode[],
  edges: CustomEdge[]
): boolean => {
  return validateConnection(connection, nodes, edges).isValid;
};

export const getConnectionErrorMessage = (
  connection: Connection,
  nodes: CustomNode[],
  edges: CustomEdge[]
): string => {
  const result = validateConnection(connection, nodes, edges);
  return (
    result.message ||
    (result.isValid ? 'Connection is valid' : 'Invalid connection')
  );
};
