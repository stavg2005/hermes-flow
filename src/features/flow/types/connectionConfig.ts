import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { Connection } from '@xyflow/react';
export type NodeType =
  | 'clients'
  | 'fileInput'
  | 'mixer'
  | 'delay'
  | 'fileOptions';

export interface NodeConnectionConfig {
  outgoing: {
    allowedTargets: Set<NodeType>;
    maxConnections: number;
    handles: Set<string>;
  };
  incoming: {
    allowedSources: Set<NodeType>;
    maxConnections: number;
    handles: Set<string>;
  };
}

export interface ConnectionValidationResult {
  isValid: boolean;
  errorType?: ConnectionErrorType;
  message?: string;
}

export type ConnectionErrorType =
  | 'SELF_CONNECTION'
  | 'INVALID_NODES'
  | 'TYPE_MISMATCH'
  | 'HANDLE_MISMATCH'
  | 'MAX_OUTGOING_EXCEEDED'
  | 'MAX_INCOMING_EXCEEDED'
  | 'DUPLICATE_CONNECTION'
  | 'CREATES_CYCLE'
  | 'SEMANTIC_ERROR';

export interface ConnectionContext {
  connection: Connection;
  sourceNode: CustomNode;
  targetNode: CustomNode;
  existingEdges: CustomEdge[];
  allNodes: CustomNode[];
}

export const NODE_CONNECTION_CONFIG: Record<NodeType, NodeConnectionConfig> = {
  clients: {
    outgoing: {
      allowedTargets: new Set([]),
      maxConnections: 0,
      handles: new Set([]),
    },
    incoming: {
      allowedSources: new Set(['mixer']),
      maxConnections: 1,
      handles: new Set(['clients-input']),
    },
  },

  fileInput: {
    outgoing: {
      allowedTargets: new Set(['mixer', 'delay']),
      maxConnections: 1,
      handles: new Set(['file-output']),
    },
    incoming: {
      allowedSources: new Set(['fileOptions', 'delay']),
      maxConnections: 2,
      handles: new Set(['file-input']),
    },
  },

  mixer: {
    outgoing: {
      allowedTargets: new Set(['clients', 'delay']),
      maxConnections: 10,
      handles: new Set(['mixer-output']),
    },
    incoming: {
      allowedSources: new Set(['fileInput', 'delay']),
      maxConnections: 7,
      handles: new Set(['mixer-input']),
    },
  },

  delay: {
    outgoing: {
      allowedTargets: new Set(['mixer','fileInput']),
      maxConnections: 1,
      handles: new Set(['delay-output', 'fileInput']),
    },
    incoming: {
      allowedSources: new Set(['fileInput', 'mixer']),
      maxConnections: 2,
      handles: new Set(['delay-input']),
    },
  },

  fileOptions: {
    outgoing: {
      allowedTargets: new Set(['fileInput']),
      maxConnections: 10,
      handles: new Set(['options-output']),
    },
    incoming: {
      allowedSources: new Set([]),
      maxConnections: 0,
      handles: new Set([]),
    },
  },
};
