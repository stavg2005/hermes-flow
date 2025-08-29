import type { Edge, Node } from '@xyflow/react';

export type CustomNode = Node;
export type CustomEdge = Edge;

export interface Client {
  Id: number;
  Ip: string;
  port: number;
}

export interface ClientData {
  id: string;
  name: string;
  ip: string;
  port: string;
  isSelected?: boolean;
  onUpdate?: (updatedData: Partial<ClientData>) => void;
  onRemove?: () => void;
}
export interface FlowState {
  nodes: CustomNode[];
  edges: CustomEdge[];
  selectedNodes: string[];
  selectedEdges: string[];
}
