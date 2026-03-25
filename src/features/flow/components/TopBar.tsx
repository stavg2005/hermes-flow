import { GetIsRunning, useAppSelector } from '@/app/store';
import React from 'react';
import AudioDashboard from './DashBoard';
import { FileControls } from './FileControls';
import { ProcessingControls } from './ProcessingControls';

const TopBar: React.FC = () => {
  const running = useAppSelector(GetIsRunning);

  return (
    <div className='fixed top-0 left-0 right-0 h-20 bg-transparent z-50 flex items-center px-6'>
      <div className='flex-1'></div>

      <div className='absolute left-1/2 transform -translate-x-1/2'>
        <FileControls />
      </div>

      <div className='flex items-center gap-3'>
        <ProcessingControls />
      </div>

      <div className='absolute top-full right-0 mt-4'>
        {running && <AudioDashboard />}
      </div>
    </div>
  );
};

export default TopBar;
