import { FileMetadata } from '@/features/flow/components/WorkflowBAR/hooks/useMinIOOperations';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface WorkflowBarState {
  isopen: boolean;
  isuploadopen: boolean;
  filesMetaData: FileMetadata[];
  dataFetched: boolean;
}

const initialState: WorkflowBarState = {
  isopen: false,
  isuploadopen: false,
  filesMetaData: [],
  dataFetched: false,
};

const WorkflowBarSlice = createSlice({
  name: 'WorkflowBar',
  initialState,
  reducers: {
    OpenModel: state => {
      state.isopen = true;
    },
    CloseModel: state => {
      state.isopen = false;
    },
    Setfiles: (state, action: PayloadAction<FileMetadata[]>) => {
      state.filesMetaData = action.payload;
    },
    setDataFetched: (state, action: PayloadAction<boolean>) => {
      state.dataFetched = action.payload;
    },
  },
});

export const WorkflowBarActions = WorkflowBarSlice.actions;
export default WorkflowBarSlice.reducer;
