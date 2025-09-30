import { selectIsOpen, useAppDispatch } from '@/app/store';
import { WorkflowBarActions } from '@/store/slices/WorkflowBarSlice';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useFileOperations } from '../hooks/useFileOperations';
import WorkflowBar from './WorkflowBAR/components/WorkflowsBar';
export const FileControls = () => {
  const { saveGraph, newGraph } = useFileOperations();
  const LoaderOpen = useSelector(selectIsOpen);
  const dispatch = useAppDispatch();
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
          onClick={() => dispatch(WorkflowBarActions.OpenModel())}
          className={buttonClass}
        >
          Load
        </button>
      </div>

      {/* Portal renders WorkflowBar outside the normal DOM hierarchy */}
      {LoaderOpen &&
        createPortal(
          <WorkflowBar
            onClose={() => dispatch(WorkflowBarActions.CloseModel())}
          />,
          document.body
        )}
    </>
  );
};
