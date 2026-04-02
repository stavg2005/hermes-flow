import { KeyboardEvent, memo } from 'react';

const DurationInput = memo<{
  duration: number;
  onDurationChange: (duration: number) => void;
}>(({ duration, onDurationChange }) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value > 0) {
        onDurationChange(value);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <div className='flex flex-row items-center justify-between gap-4'>
      <p className='text-white text-base font-bold italic font-sans opacity-90'>
        duration:
      </p>
      <div className='w-24 h-8 bg-zinc-900/60 focus-within:bg-zinc-900 rounded-full relative overflow-hidden cursor-pointer transition-colors border border-transparent focus-within:border-blue-400/50'>
        <input
          className='w-full h-full bg-transparent text-white text-base font-bold italic font-sans opacity-90 px-4 border-none outline-none rounded-full text-center'
          onKeyDown={handleKeyPress}
          onMouseDown={e => e.stopPropagation()}
          placeholder={duration.toString()}
        />
      </div>
    </div>
  );
});

export default DurationInput;
