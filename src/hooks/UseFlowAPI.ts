import {
  FileMetadata,
  FileWithContent,
  useMinIOOperations,
} from '@/features/flow/components/WorkflowBAR/hooks/useMinIOOperations';
import type { UploadResponse } from '@/lib/FlowAPI';
import { FlowAPI } from '@/lib/FlowAPI';
import { ApiErrorResponse } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// ------------------
// 🔹 Query Key Helpers
// ------------------
export const qk = {
  jsonFiles: ['json-files'] as const,
  audioFiles: ['audio-files'] as const,
  workflowFile: (name?: string) => ['workflow-file', name] as const,
};

// ------------------
// 🔹 Upload regular files via FlowAPI
// ------------------
export const useUploadFile = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => FlowAPI.uploadFile(file),
    onMutate: () =>
      toast.info('Uploading file...', {
        toastId: 'upload-file',
        autoClose: false,
      }),
    onSuccess: (data: UploadResponse) => {
      toast.dismiss('upload-file');
      toast.success(`✅ File "${data.filename}" uploaded successfully!`);
      qc.invalidateQueries({ queryKey: qk.jsonFiles });
      qc.invalidateQueries({ queryKey: qk.audioFiles });
    },
    onError: (err: ApiErrorResponse) => {
      toast.dismiss('upload-file');
      toast.error(err.message || 'File upload failed');
    },
  });
};

// ------------------
// 🔹 Query: List all JSON workflow files
// ------------------
export const useJsonFilesQuery = () => {
  const { fetchFileMetadata } = useMinIOOperations();

  return useQuery<FileMetadata[]>({
    queryKey: qk.jsonFiles,
    queryFn: () => fetchFileMetadata(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// ------------------
// 🔹 Query: List audio files
// ------------------
export const useAudioFilesQuery = () => {
  const { fetchAudioFileMetadata } = useMinIOOperations();

  return useQuery<FileMetadata[]>({
    queryKey: qk.audioFiles,
    queryFn: () => fetchAudioFileMetadata(),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// ------------------
// 🔹 Query: Load workflow content by file name
// ------------------
export const useLoadJsonFileQuery = (fileName?: string) => {
  const { loadFileContent } = useMinIOOperations();

  return useQuery<FileWithContent>({
    queryKey: qk.workflowFile(fileName),
    enabled: !!fileName,
    queryFn: async ({ queryKey, signal }) => {
      const [, name] = queryKey as ReturnType<typeof qk.workflowFile>;
      return await loadFileContent(name!, { signal });
    },
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// ------------------
// 🔹 Shared MinIO upload factory
// ------------------
function useMinIOUploadMutation(
  toastId: string,
  label: string,
  cacheKeysToInvalidate: readonly (typeof qk.jsonFiles | typeof qk.audioFiles)[]
) {
  const qc = useQueryClient();
  const { uploadToMinIO } = useMinIOOperations();

  return useMutation({
    mutationFn: (file: File) => uploadToMinIO(file),
    onMutate: () =>
      toast.info(`Uploading ${label}...`, { toastId, autoClose: false }),
    onSuccess: () => {
      toast.dismiss(toastId);
      toast.success(`${label} uploaded`);
      cacheKeysToInvalidate.forEach(key => qc.invalidateQueries({ queryKey: key }));
    },
    onError: (err: ApiErrorResponse) => {
      toast.dismiss(toastId);
      toast.error(err.message || `${label} upload failed`);
    },
  });
}

// ------------------
// 🔹 Upload workflow (to MinIO)
// ------------------
export const useUploadWorkflowMutation = () =>
  useMinIOUploadMutation('upload-workflow', 'Workflow', [qk.jsonFiles]);

// ------------------
// 🔹 Upload audio file (to MinIO)
// ------------------
export const useUploadAudioFileMutation = () =>
  useMinIOUploadMutation('upload-audio', 'Audio file', [qk.audioFiles]);
// ------------------
// 🔹 Delete workflow from MinIO
// ------------------
export const useDeleteWorkflowMutation = () => {
  const qc = useQueryClient();
  const { deleteFromMinIO } = useMinIOOperations();

  return useMutation({
    mutationFn: (fileName: string) => deleteFromMinIO(fileName),
    onMutate: () =>
      toast.info('Deleting workflow...', {
        toastId: 'delete-workflow',
        autoClose: false,
      }),
    onSuccess: (_data, fileName) => {
      toast.dismiss('delete-workflow');
      toast.success(`Workflow "${fileName}" deleted`);
      qc.invalidateQueries({ queryKey: qk.jsonFiles });
      qc.removeQueries({ queryKey: qk.workflowFile(fileName) });
    },
    onError: (err: ApiErrorResponse) => {
      toast.dismiss('delete-workflow');
      toast.error(err.message || 'Failed to delete workflow');
    },
  });
};

// ------------------
// 🔹 PostFlow — send a running flow to the Node server
// ------------------
export const usePostFlow = () => {
  return useMutation({
    mutationFn: (flow: any) => FlowAPI.PostFlow(flow),
    onMutate: () =>
      toast.info('Sending flow to server...', {
        toastId: 'post-flow',
        autoClose: false,
      }),
    onSuccess: () => {
      toast.dismiss('post-flow');
      toast.success('✅ Flow started on server');
    },
    onError: (err: ApiErrorResponse) => {
      toast.dismiss('post-flow');
      toast.error(err.message || 'Flow request failed');
    },
  });
};

// ------------------
// 🔹 StopFlow — tell the server to stop a running flow
// ------------------
export const useStopFlow = () => {
  return useMutation({
    mutationFn: (id: string) => FlowAPI.StopFlow(id),
    onSuccess: () => toast.success('🛑 Flow stopped'),
    onError: (err: ApiErrorResponse) => {
      toast.error(err.message || 'Failed to stop flow');
    },
  });
};
