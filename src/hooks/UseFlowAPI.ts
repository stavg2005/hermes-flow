import type { UploadResponse } from '@/lib/FlowAPI';
import { FlowAPI } from '@/lib/FlowAPI';
import { ApiErrorResponse } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => FlowAPI.uploadFile(file),
    onMutate: () => {
      toast.info('Uploading file...', {
        autoClose: false,
        toastId: 'file-upload', // Prevent duplicate toasts
      });
    },
    onSuccess: (data: UploadResponse) => {
      // Invalidate and refetch file list after successful upload
      toast.dismiss('file-upload');
      toast.success(`✅ File "${data.filename}" uploaded successfully!`, {
        autoClose: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: ApiErrorResponse) => {
      toast.dismiss('file-upload');
      toast.error(error.message || 'Failed to upload file. Please try again.', {
        autoClose: 5000,
      });
    },
  });
};

export const useGetFiles = () => {
  return useQuery({
    queryKey: ['files'],
    queryFn: () => FlowAPI.GetFiles(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};

export const UseStopFlow = () => {
  return useMutation({
    mutationFn: (id: string) => FlowAPI.StopFlow(id),
    onSuccess: () => {
      toast.success('File transmit stopped', { autoClose: 2000 });
    },
  });
};

export const usePostFlow = () => {
  return useMutation({
    mutationFn: (flow: any) => FlowAPI.PostFlow(flow),
    onMutate: async () => {
      // Show deleting toast
      toast.info('sending request to server', {
        autoClose: false,
        toastId: `{requet-flow}`,
      });
    },
    onSuccess: () => {
      toast.dismiss(`requet-flow`);
      toast.success('flow has started', {
        autoClose: 2000,
      });
    },
    onError: (err: ApiErrorResponse) => {
      toast.dismiss(`{requet-flow}`);
      toast.error(err.message || 'request has failed', {
        autoClose: 5000,
      });
    },
  });
};
