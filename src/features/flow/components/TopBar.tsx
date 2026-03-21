import { GetIsRunning, useAppSelector } from '@/app/store';
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
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
    audioStream,
  } = useGraphRunner();

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream;

      audioRef.current
        .play()
        .then(() => {})
        .catch(error => {
          toast.error('Autoplay blocked by browser policy:', error);
        });
    }
  }, [audioStream, running]);

  const handlePause = () => {
    // Instantly mute the local client to prevent buffer bleed
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
    pauseWorkflow();
  };

  const handleResume = () => {
    // Unmute the local client
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }

    resumeWorkflow();
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
          onStart={runWorkflow}
          onPreview={previewWorkflow}
          onStop={stopWorkflow}
          onPause={handlePause}
          onResume={handleResume}
        />

        <audio ref={audioRef} autoPlay playsInline className='hidden' />
      </div>

      <div className='absolute top-full right-0 mt-4'>
        {running && <AudioDashboard />}
      </div>
    </div>
  );
};

export default TopBar;
