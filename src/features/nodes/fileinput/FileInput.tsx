import { GetProccecedNodeID, useAppSelector } from '@/app/store';
import { useAudioFilesQuery } from '@/hooks/UseFlowAPI';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import FileDropdown from './FileDropdown';
import { useAvailableFilesForMixers } from './hooks/useAvailabeFiles';

const OUTPUT = {
  id: 'file-output',
  type: 'source' as const,
  position: Position.Right,
  style: {
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    background: '#709DFF',
    borderRadius: '50%',
    border: 'none',
  },
};
const INPUT = {
  id: 'file-input',
  type: 'target' as const,
  position: Position.Left,
  style: {
    left: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    background: '#709DFF',
    borderRadius: '50%',
    border: 'none',
  },
};

const FileInputNodeComponent: React.FC<NodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const { data: allFiles = [], isFetching } = useAudioFilesQuery();
  const isProcessing = useAppSelector(GetProccecedNodeID) === id;

  const selectedFile = String(data?.fileName ?? '');
  const names = allFiles.map(f => f.fileName);
  const selectedExists = !selectedFile || names.includes(selectedFile);

  // Only offer files not already used by sibling FileInputs that feed the same mixer(s)
  const available = useAvailableFilesForMixers(id, allFiles);

  const handleFileSelect = (file: string) => {
    updateNodeData(id, {
      fileName: file,
      filePath: file,
      options: { gain: 1 },
    });
    // No manual notify needed: nodes/edges/data changed → store subscribers re-run
  };

  return (
    <div
      className={clsx(
        'relative bg-[#383434] rounded-2xl shadow-2xl border-4 transition-all duration-200 min-w-[250px]',
        isProcessing ? 'border-white' : 'border-[#383434]',
        !selectedExists && 'border-amber-400'
      )}
      data-testid={`file-input-node-${id}`}
    >
      <Handle {...OUTPUT} />
      <Handle {...INPUT} />

      <div className='px-4 pt-3 pb-2'>
        <h3 className='text-white font-bold italic font-inter text-sm'>
          File Input
        </h3>
        {!selectedExists && (
          <p className='text-xs text-amber-300 mt-1'>
            Previously selected file no longer exists. Pick another.
          </p>
        )}
      </div>

      <div className='px-4 pb-3'>
        <FileDropdown
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          files={available} // or pass objects if your dropdown supports richer display
          isLoading={isFetching}
        />
      </div>
    </div>
  );
};

export default FileInputNodeComponent;
