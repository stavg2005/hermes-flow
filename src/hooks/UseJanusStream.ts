import { Client, MediaDevices, WebRTC } from 'janus-gateway-tsdx';
import { useCallback, useRef, useState } from 'react';
import { env } from '@/config/env';

/**
 * BrowserMediaDevicesShim
 * * The Janus SDK is environment-agnostic (it doesn't assume it's running in a browser).
 * This class acts as an adapter, telling Janus how to access the user's hardware
 * (microphone/camera) using the browser's native MediaDevices API.
 */
export class BrowserMediaDevicesShim implements MediaDevices {
  /**
   * Prompts the user for permission to use their media input devices.
   * * @param constraints - Defines what media to request (e.g., { audio: true, video: false })
   * @returns A promise that resolves to the browser's native MediaStream containing the audio tracks.
   */
  getUserMedia = (
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia(constraints);
  };
}

/**
 * BrowserWebRTCShim
 * * This class provides Janus with the core networking blocks required to establish
 * a peer-to-peer WebRTC connection. It does this by wrapping the browser's native
 * window.RTC APIs.
 */
export class BrowserWebRTCShim implements WebRTC {
  /**
   * Creates a new RTCPeerConnection (the actual pipeline for audio/video data).
   * We intercept the configuration here to inject public STUN servers.
   * * @param config - The base WebRTC configuration provided by Janus.
   * @returns A native browser RTCPeerConnection object ready for streaming.
   */
  newRTCPeerConnection = (config: RTCConfiguration): RTCPeerConnection => {
    const enhancedConfig: RTCConfiguration = {
      ...config,
      // STUN servers are required for NAT traversal (finding the client's public IP address
      // so data can bypass local routers/firewalls). We inject Google's free public STUN servers here.
      iceServers: [
        ...(config.iceServers || []),
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    return new window.RTCPeerConnection(enhancedConfig);
  };

  /**
   * Wraps the Session Description Protocol (SDP) object.
   * * This is used during the WebRTC handshake phase. Peers exchange "Offers" and "Answers"
   * (JSEP - JavaScript Session Establishment Protocol) to agree on audio codecs, bitrates,
   * and encryption before sending data.
   */
  newRTCSessionDescription = (
    jsep: RTCSessionDescriptionInit
  ): RTCSessionDescription => {
    return new window.RTCSessionDescription(jsep);
  };

  /**
   * Wraps the ICE candidate object.
   * * ICE (Interactive Connectivity Establishment) candidates represent potential network
   * routing paths (IP + port combinations) that the audio stream could take to reach
   * the Janus server.
   */
  newRTCIceCandidate = (candidate: RTCIceCandidateInit): RTCIceCandidate => {
    return new window.RTCIceCandidate(candidate);
  };
}

const API_BASE_URL = env.VITE_API_BASE_URL;

// Type inference to guarantee perfect types without needing library exports
type JanusConnection = Awaited<ReturnType<Client['createConnection']>>;
type JanusSession = Awaited<ReturnType<JanusConnection['createSession']>>;
type JanusPlugin = Awaited<ReturnType<JanusSession['attachPlugin']>>;

export const useJanusAudioStream = (serverUrl: string) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<Error | null>(null);

  // Removed 'any' and applied the inferred types!
  const pluginRef = useRef<JanusPlugin | null>(null);
  const janusClientRef = useRef<Client | null>(null);
  const sessionRef = useRef<JanusSession | null>(null);
  const connectionRef = useRef<JanusConnection | null>(null);

  const activeMountpointRef = useRef<number | null>(null);
  const operationQueue = useRef<Promise<void>>(Promise.resolve());

  const executeDisconnect = async () => {
    const mountpointId = activeMountpointRef.current;
    activeMountpointRef.current = null;

    if (pluginRef.current) {
      pluginRef.current.removeAllListeners('message');
      if (mountpointId) {
        pluginRef.current
          .send({
            janus: 'message',
            body: { request: 'destroy', id: mountpointId },
          })
          .catch(() => {});
      }
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    if (connectionRef.current) {
      connectionRef.current.close().catch(() => {});
    }

    pluginRef.current = null;
    sessionRef.current = null;
    connectionRef.current = null;
    janusClientRef.current = null;
    setAudioStream(null);
    setStatus('idle');
  };

  const disconnectFromJanus = useCallback(() => {
    operationQueue.current = operationQueue.current
      .then(async () => {
        await executeDisconnect();
      })
      .catch(err => console.error('Janus disconnect error:', err));

    return operationQueue.current;
  }, []);

  const connectToJanus = useCallback(
    (mountpointId: number, hermesSessionId: string | null) => {
      operationQueue.current = operationQueue.current.then(async () => {
        if (janusClientRef.current) {
          await executeDisconnect();
        }

        try {
          setStatus('connecting');
          setError(null);
          activeMountpointRef.current = mountpointId;

          const localClient = new Client(
            serverUrl,
            { keepalive: true },
            new BrowserMediaDevicesShim(),
            new BrowserWebRTCShim()
          );
          janusClientRef.current = localClient;

          const localConnection =
            await localClient.createConnection('audio-viewer');
          connectionRef.current = localConnection;

          const localSession = await localConnection.createSession();
          sessionRef.current = localSession;

          const localPlugin = await localSession.attachPlugin(
            'janus.plugin.streaming'
          );
          pluginRef.current = localPlugin;

          localPlugin.createPeerConnection();
          const pc = localPlugin.getPeerConnection();

          pc.oniceconnectionstatechange = () => {
            if (
              pc.iceConnectionState === 'failed' ||
              pc.iceConnectionState === 'disconnected'
            ) {
              const msg = `WebRTC ICE connection ${pc.iceConnectionState}`;
              setError(new Error(msg));
              setStatus('error');
              executeDisconnect().catch(console.error);
            }
          };

          pc.ontrack = (event: RTCTrackEvent) => {
            const stream =
              event.streams && event.streams.length > 0
                ? event.streams[0]
                : new MediaStream([event.track]);

            setAudioStream(stream);
            setStatus('playing');

            if (hermesSessionId) {
              fetch(`${API_BASE_URL}/resume/?id=${hermesSessionId}`, {
                method: 'POST',
              }).catch(err =>
                console.error('Failed to resume Hermes backend:', err)
              );
            }
          };

          // Explicitly typed the Janus message event
          localPlugin.on('message', async (message: Record<string, any>) => {
            const rawMessage = message.plainMessage || message;

            if (rawMessage.janus === 'hangup') {
              console.warn('Janus hangup:', rawMessage.reason);
              setError(
                new Error(
                  `Janus hangup: ${rawMessage.reason || 'Unknown reason'}`
                )
              );
              setStatus('error');
              executeDisconnect().catch(console.error);
              return;
            }
            const pluginData =
              rawMessage?.plugindata?.data || rawMessage?.plugin_data?.data;

            if (pluginData && pluginData.streaming === 'created') {
              await localPlugin.send({
                janus: 'message',
                body: { request: 'watch', id: mountpointId },
              });
            }

            const jsep =
              message.jsep ||
              rawMessage.jsep ||
              (message.get &&
                typeof message.get === 'function' &&
                message.get('jsep'));

            if (jsep && jsep.type === 'offer') {
              const answer = await localPlugin.createAnswer(jsep, {
                audio: true,
                video: false,
              });
              await localPlugin.send({
                janus: 'message',
                body: { request: 'start' },
                jsep: answer,
              });
            }
          });

          setStatus('creating_mountpoint');
          await localPlugin.send({
            janus: 'message',
            body: {
              request: 'create',
              type: 'rtp',
              id: mountpointId,
              description: `Hermes Dynamic Session ${mountpointId}`,
              audio: true,
              audioport: mountpointId,
              audiopt: 8,
              audiortpmap: 'PCMA/8000',
              video: false,
            },
          });
        } catch (err) {
          console.error('Janus connection failed:', err);
          setError(
            err instanceof Error ? err : new Error('Failed to connect to Janus')
          );
          setStatus('error');
          await executeDisconnect();
        }
      });

      return operationQueue.current;
    },
    [serverUrl]
  );

  return {
    audioStream,
    status,
    error,
    connectToJanus,
    disconnectFromJanus,
  };
};
