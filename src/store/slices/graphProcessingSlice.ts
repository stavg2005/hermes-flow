// store/slices/graphProcessingSlice.ts

import {
  SessionStats,
  SessionStatus,
} from '@/features/flow/hooks/useLiveSession';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface GraphProcessingState {
  isProcessing: boolean;
  isPaused: boolean;
  currentNodeId: string | null;
  activeSessionId: string | null;
  janusMountId: number | null;
  error: string | null;
  stats: SessionStats | null;
  status: SessionStatus;
}

const initialState: GraphProcessingState = {
  isProcessing: false,
  isPaused: false,
  currentNodeId: null,
  activeSessionId: null,
  janusMountId: null,
  error: null,
  stats: null,
  status: 'idle',
};

const graphProcessingSlice = createSlice({
  name: 'graphProcessing',
  initialState,
  reducers: {
    startProcessing: state => {
      state.isProcessing = true;
      state.isPaused = false;
      state.currentNodeId = null;
      state.error = null;
      state.stats = null;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    setCurrentNode: (state, action: PayloadAction<string>) => {
      if (action.payload !== '') state.currentNodeId = action.payload;
    },
    setStats: (state, action: PayloadAction<SessionStats>) => {
      state.stats = action.payload;
    },
    setJanusMount: (state, action: PayloadAction<number | null>) => {
      state.janusMountId = action.payload;
    },
    setPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload;
    },
    setStatus: (state, action: PayloadAction<SessionStatus>) => {
      state.status = action.payload;
    },
    stopProcessing: state => {
      state.isProcessing = false;
      state.isPaused = false;
      state.currentNodeId = null;
      state.activeSessionId = null;
      state.status = 'idle';
    },

    completeProcessing: state => {
      state.isProcessing = false;
      state.isPaused = false;
      state.currentNodeId = null;
      state.activeSessionId = null;
      state.error = null;
      state.status = 'finished';
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.isPaused = false;
      state.currentNodeId = null;
      state.activeSessionId = null;
      state.status = 'error';
    },
  },
});

export const graphProcessingActions = graphProcessingSlice.actions;
export default graphProcessingSlice.reducer;
