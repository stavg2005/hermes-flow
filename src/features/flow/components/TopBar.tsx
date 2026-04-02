import { GetIsRunning, useAppSelector } from '@/app/store';
import React from 'react';
import AudioDashboard from './DashBoard';
import { FileControls } from './FileControls';
import { ProcessingControls } from './ProcessingControls';

const TopBar: React.FC = () => {
  const running = useAppSelector(GetIsRunning);

  return (
    <div className='fixed top-0 left-0 right-0 h-auto md:h-20 bg-transparent z-50 flex flex-col md:flex-row items-center justify-between px-2 md:px-6 py-4 md:py-0 gap-4 md:gap-0 pointer-events-none'>
      <div className='flex-1 hidden md:block pointer-events-auto'></div>

      <div className='flex justify-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2 pointer-events-auto'>
        <FileControls />
      </div>

      <div className='flex items-center justify-end flex-1 gap-3 pointer-events-auto w-full md:w-auto px-4 md:px-0'>
        <ProcessingControls />
      </div>

      <div className='absolute top-full right-4 md:right-0 mt-4 pointer-events-auto'>
        {running && <AudioDashboard />}
      </div>
    </div>
  );
};

export default TopBar;
