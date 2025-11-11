import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import graphReducer from '@/store/slices/graphProcessingSlice';
import BarReducer from '@/store/slices/WorkflowBarSlice';
import AudioFileReducer from '@/store/slices/AudioFilesSlice';
export const store = configureStore({
  reducer: {
    graph: graphReducer,
    WorkflowBar: BarReducer,
    AudioFiles: AudioFileReducer,
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
export const selectIsOpen = (state: RootState) => state.WorkflowBar.isopen;
export const selectFilesMetaData = (state: RootState) =>
  state.WorkflowBar.filesMetaData;
export const selectDataFetched = (state: RootState) =>
  state.WorkflowBar.dataFetched;
export const selectAudioFilesMetaData = (state: RootState) =>
  state.AudioFiles.files;
export const selectDataFetchedAudio = (state: RootState) =>
  state.AudioFiles.dataFetched;
