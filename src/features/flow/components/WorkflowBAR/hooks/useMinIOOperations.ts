import { useAppDispatch } from '@/app/store';
import { WorkflowBarActions } from '@/store/slices/WorkflowBarSlice';
import { useState } from 'react';
import { toast } from 'react-toastify';
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

const API_BASE = 'http://localhost:3000';

export const useMinIOOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const uploadToMinIO = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await fetch(`${API_BASE}/upload-files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          ` File uploaded! JSON: ${result.data.jsonFiles.length}, Other: ${result.data.otherFiles.length}`
        );
        dispatch(WorkflowBarActions.setDataFetched(false));
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('MinIO upload failed:', error);
      toast.error('Upload failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileMetadata = async (): Promise<FileMetadata[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/json-files-metadata`);

      if (!response.ok) {
        throw new Error('Failed to fetch file metadata');
      }

      const result = await response.json();
      console.log(`Loaded metadata for ${result.count} files`);

      return result.files;
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      toast.error('Failed to load file list');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load specific file content when clicked
  const loadFileContent = async (
    fileName: string
  ): Promise<FileWithContent> => {
    setIsLoading(true);
    try {
      console.log(`Loading content for: ${fileName}`);

      const response = await fetch(`${API_BASE}/json/${fileName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const fileWithContent: FileWithContent = {
        fileName: result.filename,
        originalName: result.filename.replace(/^\d+-/, ''), // Remove timestamp prefix
        size: JSON.stringify(result.content).length, // Rough size estimate
        content: result.content,
        workflowName: result.filename.replace(/^\d+-/, '').replace('.json', ''),
      };

      console.log(
        `Loaded content for: ${fileName} (${fileWithContent.size} chars)`
      );
      return fileWithContent;
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error('Failed to load file content');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromMinIO = async (fileName: string, isJson: boolean = true) => {
    setIsLoading(true);
    try {
      const bucketName = isJson ? 'json-files' : 'audio-files';
      const response = await fetch(
        `${API_BASE}/bucket/${bucketName}/object/${fileName}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(`✅ File deleted: ${fileName}`);
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('MinIO delete failed:', error);
      toast.error('Delete failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBucket = async (bucketName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bucket/${bucketName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Bucket deleted: ${bucketName} (${result.objectsDeleted} objects)`
        );
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Bucket deletion failed:', error);
      toast.error('Bucket deletion failed: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    uploadToMinIO,
    deleteFromMinIO,
    deleteBucket,
    fetchFileMetadata,
    loadFileContent,
  };
};
