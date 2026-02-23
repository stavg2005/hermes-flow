// store/slices/graphProcessingSlice.ts

import {
  SessionStats,
  SessionStatus,
} from '@/features/flow/hooks/useLiveSession';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface GraphProcessingState {
  isProcessing: boolean;
  currentNodeID: string | null;
  activeSessionId: string | null;
  JanusMountID: number | null;
  error: string | null;
  stats: SessionStats | null;
  status: SessionStatus;
}

const initialState: GraphProcessingState = {
  isProcessing: false,
  currentNodeID: null,
  activeSessionId: null,
  JanusMountID: null,
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
      state.currentNodeID = null;
      state.error = null;
      state.stats = null;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    setCurrentNode: (state, action: PayloadAction<string>) => {
      if (action.payload != '') state.currentNodeID = action.payload;
    },
    setStats: (state, action: PayloadAction<SessionStats>) => {
      state.stats = action.payload;
    },
    setJanusMount: (state, action: PayloadAction<number | null>) => {
      state.JanusMountID = action.payload;
    },
    setStatus: (state, action: PayloadAction<SessionStatus>) => {
      state.status = action.payload;
    },
    stopProcessing: state => {
      state.isProcessing = false;
      state.currentNodeID = null;
      state.activeSessionId = null;
    },

    completeProcessing: state => {
      state.isProcessing = false;
      state.currentNodeID = null;
      state.activeSessionId = null;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.currentNodeID = null;
      state.activeSessionId = null;
    },
  },
});

export const graphProcessingActions = graphProcessingSlice.actions;
export default graphProcessingSlice.reducer;
