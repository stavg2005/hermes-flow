
import { useFileOperations } from '../hooks/useFileOperations';

export const FileControls = () => {
  const { saveGraph, loadGraph, newGraph } = useFileOperations();
  const buttonClass =
    'text-slate-300 hover:text-white transition-colors text-sm font-medium';

  return (
    <div className='flex items-center gap-6'>
      <button onClick={newGraph} className={buttonClass}>
        New
      </button>
      <button onClick={saveGraph} className={buttonClass}>
        Save
      </button>
      <button onClick={loadGraph} className={buttonClass}>
        Load
      </button>
    </div>
  );
};
