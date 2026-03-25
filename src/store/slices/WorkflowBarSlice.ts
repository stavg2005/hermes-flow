import { createSlice } from '@reduxjs/toolkit';

export interface WorkflowBarState {
  isopen: boolean;
  isuploadopen: boolean;
}

const initialState: WorkflowBarState = {
  isopen: false,
  isuploadopen: false,
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
  },
});

export const WorkflowBarActions = WorkflowBarSlice.actions;
export default WorkflowBarSlice.reducer;
