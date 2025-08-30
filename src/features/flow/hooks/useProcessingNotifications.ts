import { useEffect } from 'react';
import { toast } from 'react-toastify';
export const useProcessingNotifications = (
  isProcessing: boolean,
  error: string | null,
  currentNodeID: string | null
) => {
  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  // Handle success notifications
  useEffect(() => {
    if (!isProcessing && !error && !currentNodeID) {
      const wasProcessing = sessionStorage.getItem('wasProcessing');
      if (wasProcessing === 'true') {
        toast.success('Processing completed successfully');
        sessionStorage.removeItem('wasProcessing');
      }
    }

    if (isProcessing) {
      sessionStorage.setItem('wasProcessing', 'true');
    }
  }, [isProcessing, error, currentNodeID]);
};
