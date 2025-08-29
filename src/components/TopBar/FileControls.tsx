import React from 'react';

interface FileControlsProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
}

export const FileControls: React.FC<FileControlsProps> = ({
  onNew,
  onSave,
  onLoad,
}) => {
  const buttonClass =
    'text-slate-300 hover:text-white transition-colors text-sm font-medium';

  return (
    <div className='flex items-center gap-6'>
      <button onClick={onNew} className={buttonClass}>
        New
      </button>
      <button onClick={onSave} className={buttonClass}>
        Save
      </button>
      <button onClick={onLoad} className={buttonClass}>
        Load
      </button>
    </div>
  );
};
