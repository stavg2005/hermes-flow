import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import graphReducer from '@/store/slices/graphProcessingSlice';
export const store = configureStore({
  reducer: {
    graph: graphReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors

export const GetProccecedNodeID = (state: RootState) =>
  state.graph.currentNodeID;
export const GetIsRunning = (state: RootState) => state.graph.isProcessing;
