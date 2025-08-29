import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Connection,
  EdgeChange,
  NodeChange,
  XYPosition,
} from '@xyflow/react';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { CustomEdge, CustomNode, FlowState } from '../../types/types';

const initialState: FlowState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
};

let nodeId = 0;

const initializeNodeId = (nodes: CustomNode[]) => {
  nodeId =
    nodes.length > 0
      ? Math.max(
          ...nodes.map(node => parseInt(node.id.replace(/\D/g, '')) || 0)
        )
      : 0;
};
const getNodeId = (): string => `node_${++nodeId}`;

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    addNode: (
      state,
      action: PayloadAction<{
        type: string;
        position: XYPosition;
        data?: Record<string, unknown>;
      }>
    ) => {
      const { type, position, data = {} } = action.payload;

      const newNode: CustomNode = {
        id: getNodeId(),
        type,
        position,
        data: {
          label: `${type} node`,
          ...data,
        },
      };

      state.nodes.push(newNode);
    },

    updateNode: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<CustomNode>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const nodeIndex = state.nodes.findIndex(node => node.id === id);

      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = { ...state.nodes[nodeIndex], ...updates };
      }
    },

    deleteNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      // Also remove connected edges
      state.edges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
    },

    applyNodeChanges: (state, action: PayloadAction<NodeChange[]>) => {
      //apply nodes changes is from  flow- this function dosent call itself
      state.nodes = applyNodeChanges(
        action.payload,
        state.nodes
      ) as CustomNode[];
    },

    addEdge: (state, action: PayloadAction<Connection>) => {
      const newEdge = {
        ...action.payload,
        id: `edge_${action.payload.source}_${action.payload.target}`,
      } as CustomEdge;
      state.edges = addEdge(newEdge, state.edges) as CustomEdge[];
    },

    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter(edge => edge.id !== action.payload);
    },

    applyEdgeChanges: (state, action: PayloadAction<EdgeChange[]>) => {
      state.edges = applyEdgeChanges(
        action.payload,
        state.edges
      ) as CustomEdge[];
    },

    selectNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      if (!state.selectedNodes.includes(nodeId)) {
        state.selectedNodes.push(nodeId);
      }
    },

    deselectNode: (state, action: PayloadAction<string>) => {
      state.selectedNodes = state.selectedNodes.filter(
        id => id !== action.payload
      );
    },

    clearFlow: state => {
      state.nodes = [];
      state.edges = [];
      state.selectedNodes = [];
      state.selectedEdges = [];
    },

    loadFlow: (
      state,
      action: PayloadAction<{ nodes: CustomNode[]; edges: CustomEdge[] }>
    ) => {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
      state.selectedNodes = [];
      state.selectedEdges = [];

      initializeNodeId(action.payload.nodes);
    },
  },
});

export const flowActions = flowSlice.actions;
export default flowSlice.reducer;
