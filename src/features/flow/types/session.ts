/**
 * Session-level types shared across hooks, services, and the Redux store.
 * Centralised here to avoid coupling consumers to the useLiveSession hook file.
 */

export interface SessionStats {
  bytes: number;
  node: string;
  type: string;
  packets: number;
  underruns: number;
}

export type SessionStatus =
  | 'idle'
  | 'provisioning'
  | 'connecting'
  | 'streaming'
  | 'finished'
  | 'error';

export interface ProvisionResponse {
  sessionID: string;
  status: string;
  message: string;
}

export interface MinimalNode {
  id: string;
  type?: string;
  data: Record<string, unknown>;
}

export interface MinimalEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface RunRequest {
  flow: {
    start_node: MinimalNode;
    nodes: MinimalNode[];
    edges: MinimalEdge[];
  };
}

export type ExecutionMode = 'transmit' | 'preview';
