import { GetJanusMount, useAppSelector } from '@/app/store';
import { Client, MediaDevices, WebRTC } from 'janus-gateway-tsdx';
import { useEffect, useRef, useState } from 'react';
export class BrowserMediaDevicesShim implements MediaDevices {
  getUserMedia = (
    constraints: MediaStreamConstraints
  ): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia(constraints);
  };
}

export class BrowserWebRTCShim implements WebRTC {
  newRTCPeerConnection = (config: RTCConfiguration): RTCPeerConnection => {
    return new window.RTCPeerConnection(config);
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
  const streamId = useAppSelector(GetJanusMount);
  const pluginRef = useRef<any>(null);

  useEffect(() => {
    if (!streamId) {
      setStatus('waiting_for_mountpoint');
      return;
    }

    let session: any = null;
    let connection: any = null;

    const startAudioStream = async () => {
      try {
        setStatus('connecting');
        const janusClient = new Client(
          serverUrl,
          { keepalive: true },
          new BrowserMediaDevicesShim(),
          new BrowserWebRTCShim()
        );

        connection = await janusClient.createConnection('audio-viewer');
        session = await connection.createSession();
        pluginRef.current = await session.attachPlugin(
          'janus.plugin.streaming'
        );
        const activePlugin = pluginRef.current;

        activePlugin.createPeerConnection();
        const pc = activePlugin.getPeerConnection();

        pc.ontrack = (event: RTCTrackEvent) => {
          if (event.streams && event.streams[0]) {
            setAudioStream(event.streams[0]);
            setStatus('playing');
          }
        };

        // 🚨 UPDATED MESSAGE LISTENER 🚨
        activePlugin.on('message', async (message: any) => {
          console.log('Janus Message Received:', message);

          // 🚨 Unpack the tsdx wrapper! 🚨
          const rawMessage = message.plainMessage || message;
          const pluginData = rawMessage?.plugindata?.data;

          // 1. Listen for the 'created' confirmation before watching!
          if (pluginData && pluginData.streaming === 'created') {
            console.log(
              `Mountpoint ${streamId} fully created! Now requesting to watch...`
            );
            setStatus('requesting');

            await activePlugin.send({
              janus: 'message',
              body: { request: 'watch', id: streamId },
            });
          }

          // Handle any errors Janus sends back
          if (pluginData && pluginData.error) {
            console.error('Janus Plugin Error:', pluginData.error);
            setError(new Error(pluginData.error));
          }

          // 2. Handle the WebRTC JSEP Offer (triggered AFTER 'watch')
          // tsdx might attach jsep to the top level or inside plainMessage
          const jsep =
            message.jsep ||
            rawMessage.jsep ||
            (message.get && message.get('jsep'));

          if (jsep && jsep.type === 'offer') {
            setStatus('negotiating');
            try {
              const answer = await activePlugin.createAnswer(jsep, {
                audio: true,
                video: false,
              });
              await activePlugin.send({
                janus: 'message',
                body: { request: 'start' },
                jsep: answer,
              });
            } catch (err) {
              console.error('Negotiation error:', err);
            }
          }
        });

        // 🚨 SEND THE CREATE REQUEST ONLY 🚨
        // (Do not send the watch request here anymore)
        setStatus('creating_mountpoint');
        await activePlugin.send({
          janus: 'message',
          body: {
            request: 'create',
            type: 'rtp',
            id: streamId,
            description: `Hermes Dynamic Session ${streamId}`,
            audio: true,
            audioport: streamId,
            audiopt: 8,
            audiortpmap: 'PCMA/8000',
            video: false,
          },
        });
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to connect to Janus')
        );
        setStatus('error');
      }
    };

    startAudioStream();

    // 4. CLEANUP: Destroy the mountpoint when done
    return () => {
      const cleanup = async () => {
        if (pluginRef.current) {
          pluginRef.current.removeAllListeners('message');

          if (streamId) {
            await pluginRef.current
              .send({
                janus: 'message',
                body: { request: 'destroy', id: streamId },
              })
              .catch(() => console.warn('Failed to destroy mountpoint'));
          }

          await pluginRef.current
            .send({ janus: 'message', body: { request: 'stop' } })
            .catch(() => {});
          await pluginRef.current.hangup().catch(() => {});
          await pluginRef.current.detach().catch(() => {});
        }
        if (session) await session.destroy().catch(() => {});
        if (connection) await connection.close().catch(() => {});
      };
      cleanup();
    };
  }, [serverUrl, streamId]);

  // NEW: Export control functions that talk directly to Janus
  const pauseStream = () => {
    if (pluginRef.current) {
      pluginRef.current.send({ janus: 'message', body: { request: 'pause' } });
    }
  };

  const resumeStream = () => {
    if (pluginRef.current) {
      pluginRef.current.send({ janus: 'message', body: { request: 'start' } });
    }
  };

  return { audioStream, status, error, pauseStream, resumeStream };
};
