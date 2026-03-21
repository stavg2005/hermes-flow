import { Client, MediaDevices, WebRTC } from 'janus-gateway-tsdx';
import { useCallback, useRef, useState } from 'react';

export class BrowserMediaDevicesShim implements MediaDevices {
  getUserMedia = (
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia(constraints);
  };
}

export class BrowserWebRTCShim implements WebRTC {
  newRTCPeerConnection = (config: RTCConfiguration): RTCPeerConnection => {
    const enhancedConfig: RTCConfiguration = {
      ...config,
      iceServers: [
        ...(config.iceServers || []),
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    return new window.RTCPeerConnection(enhancedConfig);
  };

  newRTCSessionDescription = (
    jsep: RTCSessionDescriptionInit
  ): RTCSessionDescription => {
    return new window.RTCSessionDescription(jsep);
  };

  newRTCIceCandidate = (candidate: RTCIceCandidateInit): RTCIceCandidate => {
    return new window.RTCIceCandidate(candidate);
  };
}

export const useJanusAudioStream = (serverUrl: string) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<Error | null>(null);

  const pluginRef = useRef<any>(null);
  const janusClientRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
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

    // Give the WebSocket exactly 50ms to transmit the destroy message over the network
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
        console.log('Executing queued Janus disconnect...');
        await executeDisconnect();
      })
      .catch(err => console.error('Janus disconnect error:', err));

    return operationQueue.current;
  }, []);

  const connectToJanus = useCallback(
    (mountpointId: number, hermesSessionId: string | null) => {
      operationQueue.current = operationQueue.current.then(async () => {
        console.log(
          `Executing queued Janus connect for mountpoint ${mountpointId}...`
        );

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
            console.log('ICE Connection State:', pc.iceConnectionState);
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
            console.log('WebRTC track received!', event.track);

            const stream =
              event.streams && event.streams.length > 0
                ? event.streams[0]
                : new MediaStream([event.track]);

            setAudioStream(stream);
            setStatus('playing');

            if (hermesSessionId) {
              fetch(`http://localhost:5000/resume/?id=${hermesSessionId}`, {
                method: 'POST',
              }).catch(err =>
                console.error('Failed to resume Hermes backend:', err)
              );
            }
          };

          localPlugin.on('message', async (message: any) => {
            console.log('Janus Message:', message);
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
              console.log(
                `Mountpoint ${mountpointId} fully created! Now requesting to watch...`
              );
              await localPlugin.send({
                janus: 'message',
                body: { request: 'watch', id: mountpointId },
              });
            }

            const jsep =
              message.jsep ||
              rawMessage.jsep ||
              (message.get && message.get('jsep'));
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
