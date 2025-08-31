// types/connectionRules.ts
import { Connection } from '@xyflow/react';
import { NodeType } from '@/features/nodes/types/nodes';
import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';

export interface ConnectionRules {
  canConnectTo: Set<NodeType>;
  canReceiveFrom: Set<NodeType>;
  handles: {
    source: Set<string>;
    target: Set<string>;
  };
  maxOutgoing: number;
  maxIncoming: number;
}

export interface ConnectionRule {
  name: string;
  validate: (
    connection: Connection,
    nodes: CustomNode[],
    edges: CustomEdge[]
  ) => boolean;
  getErrorMessage: (
    connection: Connection,
    nodes: CustomNode[],
    edges: CustomEdge[]
  ) => string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  message?: string;
}
