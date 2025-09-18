import { useFileOperations } from '../hooks/useFileOperations';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import WorkflowBar from './WorkflowBAR/WorkflowsBar';

export const FileControls = () => {
  const { saveGraph, newGraph } = useFileOperations();
  const [LoaderOpen, setLoaderOpen] = useState(false);
  const buttonClass =
    'text-slate-300 hover:text-white transition-colors text-sm font-medium';

  return (
    <>
      <div className='flex items-center gap-6'>
        <button onClick={newGraph} className={buttonClass}>
          New
        </button>
        <button onClick={saveGraph} className={buttonClass}>
          Download
        </button>
        <button
          onClick={() => setLoaderOpen(!LoaderOpen)}
          className={buttonClass}
        >
          Load
        </button>
      </div>

      {/* Portal renders WorkflowBar outside the normal DOM hierarchy */}
      {LoaderOpen &&
        createPortal(
          <WorkflowBar onClose={() => setLoaderOpen(false)} />,
          document.body
        )}
    </>
  );
};
