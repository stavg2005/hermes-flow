import { GetIsRunning, useAppSelector } from '@/app/store';
import { useJanusAudioStream } from '@/hooks/UseJanusStream';
import React, { useEffect, useRef } from 'react';
import { useGraphRunner } from '../hooks/useGraphRunner';
import AudioDashboard from './DashBoard';
import { FileControls } from './FileControls';
import { ProcessingControls } from './ProcessingControls';

const TopBar: React.FC = () => {
  const running = useAppSelector(GetIsRunning);
  const {
    runWorkflow,
    previewWorkflow,
    stopWorkflow,
    resumeWorkflow,
    pauseWorkflow,
    isProcessing,
  } = useGraphRunner();
  const audioRef = useRef<HTMLAudioElement>(null);

  const { audioStream, pauseStream, resumeStream } = useJanusAudioStream(
    'ws://localhost:8188'
  );

  useEffect(() => {
    if (audioRef.current && audioStream) {
      // 1. Attach the WebRTC stream to the audio element
      audioRef.current.srcObject = audioStream;

      // 2. Explicitly tell the browser to play it
      audioRef.current
        .play()
        .then(() => {
          console.log('Audio is playing successfully!');
        })
        .catch(error => {
          // If the browser blocks it, you'll see this error in your console
          console.warn('Autoplay blocked by browser policy:', error);
        });
    }
  }, [audioStream, running]);

  const handlePause = () => {
    pauseStream();
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
    pauseWorkflow();
  };

  const handleResume = () => {
    resumeStream();

    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }

    resumeWorkflow();
  };

  const unlockAudio = async () => {
    const audio = new Audio();

    audio.src =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

    try {
      await audio.play();
      console.log('iOS audio unlocked');
    } catch (e) {
      console.warn('Unlock failed:', e);
    }
  };
  const handleStart = async () => {
    await unlockAudio(); // 👈 must be FIRST
    runWorkflow(); // 👈 then start Janus
  };
  return (
    <div className='fixed top-0 left-0 right-0 h-20 bg-transparent z-50 flex items-center px-6'>
      <div className='flex-1'></div>

      <div className='absolute left-1/2 transform -translate-x-1/2'>
        <FileControls />
      </div>

      <div className='flex items-center gap-3'>
        <ProcessingControls
          isProcessing={isProcessing}
          onStart={handleStart}
          onPreview={previewWorkflow}
          onStop={stopWorkflow}
          onPause={handlePause}
          onResume={handleResume}
        />

        {running && <audio ref={audioRef} autoPlay playsInline />}
      </div>

      <div className='absolute top-full right-0 mt-4'>
        {running && <AudioDashboard />}
      </div>
    </div>
  );
};

export default TopBar;
