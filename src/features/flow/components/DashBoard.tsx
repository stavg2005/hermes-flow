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
    <div className='p-5 w-64 md:w-72 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl flex flex-col transition-all duration-300'>
      <div className='flex items-center gap-3 mb-4 pb-3 border-b border-slate-700/50'>
        <div className={`w-2 h-2 rounded-full shadow-lg ${status === 'streaming' || status === 'connecting' ? 'bg-green-400 animate-pulse shadow-green-400/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
        <h1 className='text-sm font-bold uppercase tracking-wider text-slate-200'>Network Stats</h1>
      </div>

      <div className='flex flex-col space-y-3 flex-1'>
        {stats ? (
          <>
            <div className='flex justify-between items-center bg-slate-800/30 p-2 rounded-lg border border-slate-700/30'>
              <span className='text-xs text-slate-400 font-medium'>Active Node</span>
              <span className='text-xs font-bold text-blue-400 truncate max-w-[120px]'>{stats.node}</span>
            </div>
            
            <div className='flex justify-between items-center px-2'>
              <span className='text-xs text-slate-400 font-medium'>Processed</span>
              <span className='text-xs font-semibold text-slate-200 tabular-nums'>{stats.bytes.toLocaleString()} bytes</span>
            </div>
            
            <div className='flex justify-between items-center px-2'>
              <span className='text-xs text-slate-400 font-medium'>Packets Sent</span>
              <span className='text-xs font-semibold text-slate-200 tabular-nums'>{stats.packets.toLocaleString()}</span>
            </div>
            
            <div className='flex justify-between items-center px-2'>
              <span className='text-xs text-slate-400 font-medium'>Underruns</span>
              <span className={`text-xs font-bold tabular-nums ${stats.underruns > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {stats.underruns > 0 ? `⚠️ ${stats.underruns.toLocaleString()}` : '0'}
              </span>
            </div>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center h-28 opacity-60'>
            <svg className='w-8 h-8 text-slate-500 mb-2 animate-bounce' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
            </svg>
            <span className='text-xs text-slate-400 italic'>Awaiting stream data...</span>
          </div>
        )}

        {error && (
          <div className='mt-3 p-2.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 flex gap-2 items-start'>
            <svg className='w-4 h-4 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='leading-tight'>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioDashboard;
