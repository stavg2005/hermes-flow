import { useState, useRef } from 'react';
export const useFileUpload = (
  onWorkflowAdd: (workflowName: string, content: any) => void
) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted file processing logic
  const processFile = (file: File) => {
    console.log('Selected file:', file);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        console.log('JSON content:', jsonContent);

        // Extract filename without extension for workflow name
        const workflowName = file.name.replace('.json', '');

        // Add the new workflow
        onWorkflowAdd(workflowName, jsonContent);
      } catch (error) {
        console.error('Invalid JSON file:', error);
        alert('Error: Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    setShowFileUpload(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    } else {
      alert('Please select a valid JSON file');
    }
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  const openUploadModal = () => setShowFileUpload(true);
  const closeUploadModal = () => setShowFileUpload(false);

  return {
    showFileUpload,
    fileInputRef,
    handleFileSelect,
    processFile,
    openFileExplorer,
    openUploadModal,
    closeUploadModal,
  };
};
