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
import { useJanusAudioStream } from '@/hooks/UseJanusStream';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { Edge, Node } from '@xyflow/react';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { env } from '@/config/env';

export type ExecutionMode = 'transmit' | 'preview';
const API_BASE_URL = env.VITE_API_BASE_URL;
const JANUS_WS_URL = env.VITE_JANUS_WS_URL;

export const useLiveSession = () => {
  const stats = useAppSelector(state => state.graph.stats);
  const status = useAppSelector(state => state.graph.status);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const dispatch = useAppDispatch();

  // 2. Initialize the imperative Janus hook here
  const {
    audioStream,
    connectToJanus,
    disconnectFromJanus,
    error: janusError,
  } = useJanusAudioStream(JANUS_WS_URL);

  useEffect(() => {
    if (janusError) {
      const errorMsg = `Janus WebRTC Error: ${janusError.message}`;
      setError(errorMsg); // Update local state

      dispatch(graphProcessingActions.setError(errorMsg));
      dispatch(graphProcessingActions.setStatus('error'));

      disconnectFromJanus();
    }
  }, [janusError, dispatch, disconnectFromJanus]);

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
        const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
        const ws = new WebSocket(
          `${wsUrl}/connect/?id=${data.sessionID}`
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

              // 🚨 3. Clean up Janus when processing completes
              disconnectFromJanus();
              ws.close();
            } else if (payload.type === 'error') {
              toast.error(payload.message);
              dispatch(graphProcessingActions.setError(payload.message));
              disconnectFromJanus(); // Clean up on error
            } else if (payload.type === 'webrtc_ready') {
              dispatch(
                graphProcessingActions.setJanusMount(
                  Number(payload.mountpoint_id)
                )
              );

              // 🚨 4. Start the WebRTC connection exactly when Hermes is ready
              connectToJanus(Number(payload.mountpoint_id), data.sessionID);
            }
          } catch (e) {
            console.error('WS Parse Error', e);
          }
        };

        ws.onerror = () => {
          setError('WebSocket connection failed.');
          dispatch(graphProcessingActions.setStatus('error'));
          disconnectFromJanus();
        };

        ws.onclose = event => {
          if (event.wasClean) {
            console.log('websocket closed');
            dispatch(graphProcessingActions.setStatus('finished'));
            disconnectFromJanus(); // 🚨 5. Safety cleanup if socket closes
          }
        };
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
        dispatch(graphProcessingActions.setStatus('error'));
      }
    },
    [dispatch, connectToJanus, disconnectFromJanus] // Add to dependencies
  );

  // Cleanup: Close socket and WebRTC when component unmounts
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      disconnectFromJanus();
    };
  }, [disconnectFromJanus]);

  // 6. Export everything your UI needs
  return {
    startSession,
    stats,
    status,
    error,
    audioStream,
  };
};
