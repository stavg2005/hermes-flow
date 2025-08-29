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
    <div className='flex flex-row'>
      <p className='text-white text-[16px] font-bold italic font-sans opacity-90'>
        duration:
      </p>
      <div className='w-26 h-8 bg-[#2a2626] rounded-full relative overflow-hidden cursor-pointer ml-20'>
        <input
          className='w-full h-full bg-transparent text-white text-[16px] font-bold italic font-sans opacity-90 px-5 border-none outline-none rounded-full'
          onKeyDown={handleKeyPress}
          onMouseDown={e => e.stopPropagation()}
          placeholder={duration.toString()}
        />
      </div>
    </div>
  );
});

export default DurationInput;
