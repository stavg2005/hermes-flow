import api from './api';

export interface FilesResponse {
  files: string[];
}
export interface PostFlowResponse {
  id: number;
  status: string;
  error: string;
}

export interface StopFlowResponse {
  status: string;
  error: string;
}
export interface UploadResponse {
  status: string;
  message: string;
  filename: string;
}
export const FlowAPI = {
  PostFlow: async (flow: object): Promise<PostFlowResponse> => {
    const response = await api.post<PostFlowResponse>(`/transmit/`, { flow });
    return response.data;
  },

  /** Stop a running session on the C++ engine. */
  stopSession: async (id: string): Promise<StopFlowResponse> => {
    const response = await api.post<StopFlowResponse>(`/stop/?id=${id}`);
    return response.data;
  },

  /** Pause a running session on the C++ engine. */
  pauseSession: async (id: string): Promise<void> => {
    await api.post(`/pause/?id=${id}`);
  },

  /** Resume a paused session on the C++ engine. */
  resumeSession: async (id: string): Promise<void> => {
    await api.post(`/resume/?id=${id}`);
  },

  /** @deprecated Use stopSession instead. Kept for legacy hook compatibility. */
  StopFlow: async (id: string): Promise<StopFlowResponse> => {
    return FlowAPI.stopSession(id);
  },

  GetFiles: async (): Promise<FilesResponse> => {
    const response = await api.post<FilesResponse>(`/flow/files`);
    return response.data;
  },

  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
