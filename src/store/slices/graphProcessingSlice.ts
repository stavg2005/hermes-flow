// store/slices/graphProcessingSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GraphProcessingState {
  isProcessing: boolean;
  currentNodeID: string | null;
  error: string | null;
}

const initialState: GraphProcessingState = {
  isProcessing: false,
  currentNodeID: null,
  error: null,
};

const graphProcessingSlice = createSlice({
  name: 'graphProcessing',
  initialState,
  reducers: {
    startProcessing: state => {
      state.isProcessing = true;
      state.currentNodeID = null;
      state.error = null;
    },

    setCurrentNode: (state, action: PayloadAction<string>) => {
      state.currentNodeID = action.payload;
    },

    stopProcessing: state => {
      state.isProcessing = false;
      state.currentNodeID = null;
    },

    completeProcessing: state => {
      state.isProcessing = false;
      state.currentNodeID = null;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isProcessing = false;
      state.currentNodeID = null;
    },
  },
});

export const graphProcessingActions = graphProcessingSlice.actions;
export default graphProcessingSlice.reducer;
