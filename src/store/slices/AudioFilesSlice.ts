import { FileMetadata } from '@/features/flow/components/WorkflowBAR/hooks/useMinIOOperations';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioFileState {
  files: FileMetadata[];
  dataFetched: boolean;
}

const initialState: AudioFileState = {
  files: [],
  dataFetched: false,
};

const AudioFilesSlice = createSlice({
  name: 'AudioFiles',
  initialState,
  reducers: {
    Setfiles: (state, action: PayloadAction<FileMetadata[]>) => {
      state.files = action.payload;
    },
    setDataFetched: (state, action: PayloadAction<boolean>) => {
      state.dataFetched = action.payload;
    },
  },
});

export const AudioFilesActions = AudioFilesSlice.actions;
export default AudioFilesSlice.reducer;
