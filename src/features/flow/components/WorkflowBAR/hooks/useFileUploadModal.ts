// hooks/useFileUploadModal.ts
import { useUploadWorkflowMutation } from '@/hooks/UseFlowAPI';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
export const useFileUploadModal = (onClose: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadWorkflowMutation();

  const uploadJsonFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Validate JSON
      const text = await file.text();
      JSON.parse(text);

      // Upload
      await uploadMutation.mutateAsync(file);

      // Close on success
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Error: Invalid JSON file format');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAudioFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Upload
      await uploadMutation.mutateAsync(file);

      // Close on success
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Error: Invalid audio file format');
    } finally {
      setIsUploading(false);
    }
  };

  // File input handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === 'application/json') {
      await uploadJsonFile(file);
    } else if (file?.name?.endsWith('.wav')) {
      await uploadAudioFile(file);
    } else {
      toast.error('Please select a valid JSON file');
    }
  };

  const openFileExplorer = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Drag & drop handlers
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file?.type === 'application/json' || file?.name?.endsWith('.json')) {
      await uploadJsonFile(file);
    } else if (file?.name?.endsWith('.wav')) {
      await uploadAudioFile(file);
    } else {
      toast.error('Please drop a valid JSON file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  return {
    // State
    isUploading,
    isDragOver,
    fileInputRef,

    // File input handlers
    handleFileSelect,
    openFileExplorer,

    // Drag & drop handlers
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  };
};
