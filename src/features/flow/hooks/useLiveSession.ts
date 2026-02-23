export interface SessionStats {
  bytes: number;
  node: string;
  type: string;
  packets: number;
  underruns: number;
}

export type SessionStatus =
  | 'idle'
  | 'provisioning'
  | 'connecting'
  | 'streaming'
  | 'finished'
  | 'error';

export interface ProvisionResponse {
  sessionID: string;
  status: string;
  message: string;
}

export interface RunRequest {
  flow: {
    start_node: CustomNode;
    nodes: Node[];
    edges: Edge[];
  };
}
import { useAppDispatch, useAppSelector } from '@/app/store';
import { CustomNode } from '@/features/nodes/types/nodes';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { Edge, Node } from '@xyflow/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

export type ExecutionMode = 'transmit' | 'preview';
const API_BASE_URL = 'http://localhost:5000';
export const useLiveSession = () => {
  const stats = useAppSelector(state => state.graph.stats);
  const status = useAppSelector(state => state.graph.status);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const dispatch = useAppDispatch();
  const startSession = useCallback(
    async (payload: RunRequest, mode: ExecutionMode = 'transmit') => {
      try {
        dispatch(graphProcessingActions.setStatus('provisioning'));
        setError(null);

        const { data } = await axios.post<ProvisionResponse>(
          `${API_BASE_URL}/${mode}/`,
          payload
        );
        dispatch(graphProcessingActions.setSessionId(data.sessionID));

        dispatch(graphProcessingActions.setStatus('connecting'));
        const ws = new WebSocket(
          `ws://localhost:5000/connect/?id=${data.sessionID}`
        );
        socketRef.current = ws;

        ws.onopen = () => {
          dispatch(graphProcessingActions.setStatus('streaming'));
          console.log(`Connected to session: ${data.sessionID}`);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const payload = JSON.parse(event.data);

            if (payload.type === 'stats') {
              dispatch(graphProcessingActions.setStats(payload));

              if (payload.node) {
                dispatch(graphProcessingActions.setCurrentNode(payload.node));
              }
            } else if (payload.type === 'completion') {
              toast.success('Processing Complete');
              dispatch(graphProcessingActions.completeProcessing());
              ws.close();
            } else if (payload.type === 'error') {
              toast.error(payload.message);
              dispatch(graphProcessingActions.setError(payload.message));
            } else if (payload.type === 'webrtc_ready') {
              dispatch(
                graphProcessingActions.setJanusMount(
                  Number(payload.mountpoint_id)
                )
              );
            }
          } catch (e) {
            console.error('WS Parse Error', e);
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection failed.');
          dispatch(graphProcessingActions.setStatus('error'));
        };

        ws.onclose = event => {
          if (event.wasClean) {
            console.log('websocket closed');
            dispatch(graphProcessingActions.setStatus('finished'));
          }
        };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        dispatch(graphProcessingActions.setStatus('error'));
      }
    },
    [dispatch]
  );

  // Cleanup: Close socket when component unmounts
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  return { startSession, stats, status, error };
};
