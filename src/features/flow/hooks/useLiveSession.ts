import { useAppDispatch, useAppSelector } from '@/app/store';
import { env } from '@/config/env';
import { useJanusAudioStream } from '@/hooks/UseJanusStream';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useHermesWebSocket } from './useHermesWebSocket';
import type { ExecutionMode, ProvisionResponse, RunRequest } from '../types/session';

export type { ExecutionMode, MinimalEdge, MinimalNode, RunRequest, SessionStats, SessionStatus } from '../types/session';

const API_BASE_URL = env.VITE_API_BASE_URL;
const JANUS_WS_URL = env.VITE_JANUS_WS_URL;

export const useLiveSession = () => {
  const stats = useAppSelector(state => state.graph.stats);
  const status = useAppSelector(state => state.graph.status);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // 1. Initialize Janus Hook
  const {
    audioStream,
    connectToJanus,
    disconnectFromJanus,
    error: janusError,
  } = useJanusAudioStream(JANUS_WS_URL);

  // 2. Setup WebSocket Callbacks
  const handleWebRTCReady = useCallback(
    (mountpointId: number, sessionId: string) => {
      connectToJanus(mountpointId, sessionId);
    },
    [connectToJanus]
  );

  const handleJanusCleanup = useCallback(() => {
    disconnectFromJanus();
  }, [disconnectFromJanus]);

  const handleWSError = useCallback(
    (msg: string) => {
      setError(msg);
      disconnectFromJanus();
    },
    [disconnectFromJanus]
  );

  // 3. Initialize WebSocket Hook
  const { connectWS, disconnectWS } = useHermesWebSocket({
    onWebRTCReady: handleWebRTCReady,
    onComplete: handleJanusCleanup,
    onError: handleWSError,
    onClose: handleJanusCleanup,
  });

  // 4. Handle Janus Errors
  useEffect(() => {
    if (janusError) {
      const errorMsg = `Janus WebRTC Error: ${janusError.message}`;
      setError(errorMsg);
      dispatch(graphProcessingActions.setError(errorMsg));
      dispatch(graphProcessingActions.setStatus('error'));
      disconnectFromJanus();
      disconnectWS();
    }
  }, [janusError, dispatch, disconnectFromJanus, disconnectWS]);

  // 5. Start Session Action
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
        connectWS(data.sessionID);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? 'Unknown error';
        setError(message);
        dispatch(graphProcessingActions.setStatus('error'));
      }
    },
    [dispatch, connectWS]
  );

  return {
    startSession,
    stats,
    status,
    error,
    audioStream,
  };
};
