import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useLiveSession } from '../hooks/useLiveSession';

const AudioDashboard: React.FC = () => {
  const { stats, status, error } = useLiveSession();

  const isStarted = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'error' && error) {
      dispatch(graphProcessingActions.stopProcessing());
      toast.error(error);
      isStarted.current = false;
    }
  }, [status, error, dispatch]);

  return (
    <div className='p-6 max-w-md mx-auto  bg-[#1b333c]/50 backdrop-blur-md rounded-2xl border border-slate-700/50 z-99 h-[20vh] w-[25vh] '>
      <h1 className='text-2xl font-bold mb-4 text-white'>Stats Monitor</h1>

      <div className='mt-4 space-y-2'>
        {stats && (
          <div className='border-t pt-4'>
            <p className='text-sm text-white'>
              Current Node: <strong>{stats.node}</strong>
            </p>

            <p className='text-xs text-right mt-1 text-white'>
              {stats.bytes.toLocaleString()} bytes processed
            </p>

            <p className='text-xs text-right mt-1 text-white'>
              {stats.packets.toLocaleString()} packets sent
            </p>

            <p className='text-xs text-right mt-1 text-white'>
              {stats.underruns.toLocaleString()} underruns
            </p>
          </div>
        )}

        {error && (
          <div className='p-3 bg-red-100 text-red-700 rounded text-sm'>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDashboard;
