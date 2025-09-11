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
  PostFlow: async (flow: JSON): Promise<PostFlowResponse> => {
    const response = await api.post<PostFlowResponse>(`/flow`, {
      flow,
    });

    return response.data;
  },
  StopFlow: async (id: string): Promise<StopFlowResponse> => {
    const response = await api.post<StopFlowResponse>(`/flow/stop/${id}`);
    return response.data;
  },
  GetFiles: async (): Promise<FilesResponse> => {
    const response = await api.post<FilesResponse>(`/flow/files`);
    return response.data;
  },
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  },
};
