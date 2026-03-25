import { useAppDispatch } from '@/app/store';
import { env } from '@/config/env';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const API_BASE_URL = env.VITE_API_BASE_URL;

interface UseHermesWebSocketProps {
  onWebRTCReady: (mountpointId: number, sessionId: string) => void;
  onComplete: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export const useHermesWebSocket = ({
  onWebRTCReady,
  onComplete,
  onError,
  onClose,
}: UseHermesWebSocketProps) => {
  const dispatch = useAppDispatch();
  const socketRef = useRef<WebSocket | null>(null);

  const disconnectWS = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const connectWS = useCallback(
    (sessionId: string) => {
      disconnectWS();

      dispatch(graphProcessingActions.setStatus('connecting'));
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
      const ws = new WebSocket(`${wsUrl}/connect/?id=${sessionId}`);
      socketRef.current = ws;

      ws.onopen = () => {
        dispatch(graphProcessingActions.setStatus('streaming'));
        console.log(`Connected to session: ${sessionId}`);
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
            onComplete();
            disconnectWS();
          } else if (payload.type === 'error') {
            toast.error(payload.message);
            dispatch(graphProcessingActions.setError(payload.message));
            onError(payload.message);
            disconnectWS();
          } else if (payload.type === 'webrtc_ready') {
            dispatch(
              graphProcessingActions.setJanusMount(
                Number(payload.mountpoint_id)
              )
            );
            onWebRTCReady(Number(payload.mountpoint_id), sessionId);
          }
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };

      ws.onerror = () => {
        dispatch(graphProcessingActions.setStatus('error'));
        onError('WebSocket connection failed.');
        disconnectWS();
      };

      ws.onclose = event => {
        if (event.wasClean) {
          console.log('websocket closed');
          dispatch(graphProcessingActions.setStatus('finished'));
        } else {
          console.error('websocket closed unexpectedly');
          dispatch(graphProcessingActions.setStatus('error'));
          onError(
            'WebSocket closed unexpectedly (Server crash or network issue).'
          );
        }
        onClose();
      };
    },
    [dispatch, onWebRTCReady, onComplete, onError, onClose, disconnectWS]
  );

  useEffect(() => {
    return () => disconnectWS();
  }, [disconnectWS]);

  return { connectWS, disconnectWS };
};
