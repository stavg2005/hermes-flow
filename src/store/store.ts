import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import flowReducer from './slices/flowSlice';

import graphReducer from './slices/graphProcessingSlice';
export const store = configureStore({
  reducer: {
    flow: flowReducer,
    graph: graphReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors
export const selectFlowState = (state: RootState) => state.flow;
export const selectNodes = (state: RootState) => state.flow.nodes;
export const selectEdges = (state: RootState) => state.flow.edges;
export const selectSelectedNodes = (state: RootState) =>
  state.flow.selectedNodes;

export const GetProccecedNodeID = (state: RootState) =>
  state.graph.currentNodeID;
export const GetIsRunning = (state: RootState) => state.graph.isProcessing;
