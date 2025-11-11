export interface FileMetadata {
  fileName: string;
  originalName: string;
  size: number;
  lastModified?: string;
}

export interface FileWithContent {
  fileName: string;
  originalName: string;
  size: number;
  content: any;
  workflowName: string;
}

// useMinIOOperations.ts
const API_BASE = 'http://localhost:3000';

export const useMinIOOperations = () => {
  const uploadToMinIO = async (file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    const res = await fetch(`${API_BASE}/upload-files`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const fetchFileMetadata = async (): Promise<FileMetadata[]> => {
    const res = await fetch(`${API_BASE}/json-files-metadata`);
    if (!res.ok) throw new Error('Failed to fetch file metadata');
    const result = await res.json();
    return result.files as FileMetadata[];
  };

  const fetchAudioFileMetadata = async (): Promise<FileMetadata[]> => {
    const res = await fetch(`${API_BASE}/audio-files-metadata`);
    if (!res.ok) throw new Error('Failed to fetch audio metadata');
    const result = await res.json();
    return result.files as FileMetadata[];
  };

  const loadFileContent = async (
    fileName: string,
    opts?: { signal?: AbortSignal }
  ): Promise<FileWithContent> => {
    const res = await fetch(`${API_BASE}/json/${fileName}`, {
      signal: opts?.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    return {
      fileName: result.filename,
      originalName: result.filename.replace(/^\d+-/, ''),
      size: JSON.stringify(result.content).length,
      content: result.content,
      workflowName: result.filename.replace(/^\d+-/, '').replace('.json', ''),
    };
  };

  const deleteFromMinIO = async (fileName: string) => {
    const res = await fetch(`${API_BASE}/json/${fileName}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  const deleteBucket = async (bucketName: string) => {
    const res = await fetch(`${API_BASE}/bucket/${bucketName}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  return {
    uploadToMinIO,
    deleteFromMinIO,
    deleteBucket,
    fetchFileMetadata,
    fetchAudioFileMetadata,
    loadFileContent,
  };
};
