import { Pause, Play, Radio, Square } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { useGraphRunner } from '../hooks/useGraphRunner';

export const ProcessingControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const isPaused = useAppSelector(state => state.graph.isPaused);
  const {
    isProcessing,
    runWorkflow,
    stopWorkflow,
    pauseWorkflow,
    resumeWorkflow,
    previewWorkflow,
    audioStream,
  } = useGraphRunner();

  // Audio playback management
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && audioStream) {
      audioRef.current.srcObject = audioStream;

      audioRef.current.play().catch(error => {
        toast.error(`Autoplay blocked by browser policy: ${error}`);
      });
    }
  }, [audioStream, isProcessing]);

  const setAudioTracksEnabled = (enabled: boolean) => {
    audioStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  };

  const handlePause = () => {
    setAudioTracksEnabled(false);
    pauseWorkflow();
    dispatch(graphProcessingActions.setPaused(true));
  };

  const handleResume = () => {
    setAudioTracksEnabled(true);
    resumeWorkflow();
    dispatch(graphProcessingActions.setPaused(false));
  };

  const buttonClass =
    'flex items-center gap-2 px-4 py-2 bg-[#193643] hover:bg-[#214e62] text-white rounded-lg transition-colors text-sm font-medium border border-[#ecca93]';

  if (isProcessing) {
    return (
      <div className='flex items-center gap-3'>
        <button
          onClick={() => {
            if (isPaused) {
              handleResume();
            } else {
              handlePause();
            }
          }}
          className={buttonClass}
        >
          {isPaused ? (
            <Play className='w-4 h-4 fill-current' />
          ) : (
            <Pause className='w-4 h-4 fill-current' />
          )}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={() => {
            stopWorkflow();
          }}
          className={buttonClass}
        >
          <Square className='w-4 h-4 fill-current' />
          Stop
        </button>

        {/* Hidden audio element moved here */}
        <audio ref={audioRef} autoPlay playsInline className='hidden' />
      </div>
    );
  }

  return (
    <div className='flex gap-2'>
      <button onClick={previewWorkflow} className={buttonClass}>
        <Play className='w-4 h-4 fill-current' />
        Preview
      </button>

      <button onClick={runWorkflow} className={buttonClass}>
        <Radio className='w-4 h-4 fill-current' />
        Transmit
      </button>

      {/* Hidden audio element moved here */}
      <audio ref={audioRef} autoPlay playsInline className='hidden' />
    </div>
  );
};
