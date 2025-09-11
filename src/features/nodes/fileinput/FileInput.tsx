import { GetProccecedNodeID, useAppSelector } from '@/app/store';
import { FileInputNodeData } from '@/features/nodes/types/NodeData';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import FileDropdown from './FileDropdown';
import {
  useAvailableFilesWithEmitter,
  notifyFlowUpdate,
} from './hooks/useAvailabeFiles';
import { useOptions } from './hooks/useOptions';

const OUTPUT_HANDLE_PROPS = {
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

const INPUT_HANDLE_PROPS = {
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
  const [selectedFile, setSelectedFile] = useState('');
  const { updateNodeData } = useReactFlow();

  const availableFiles = useAvailableFilesWithEmitter(id, selectedFile);
  const recivedData = useOptions(id);
  const currentProcessingNode = useAppSelector(GetProccecedNodeID);
  const isProcessing = currentProcessingNode === id;

  const handleFileSelect = useCallback(
    (file: string) => {
      setSelectedFile(file);
      const nodeData: FileInputNodeData = {
        filePath: file,
        fileName: file,
        options: { gain: 1 },
      };
      updateNodeData(id, nodeData);

      // Notify other components that the flow has updated
      notifyFlowUpdate();
    },
    [id, updateNodeData]
  );

  useEffect(() => {
    if (recivedData) {
      console.log('options data' + JSON.stringify(recivedData));
    }
  }, [recivedData]);

  useEffect(() => {
    const formatedData = data as FileInputNodeData;
    if (
      formatedData?.fileName &&
      formatedData.fileName !== selectedFile &&
      formatedData.fileName !== 'unknown'
    ) {
      setSelectedFile(formatedData.fileName);
    }
  }, [data, selectedFile]);

  return (
    <div
      className={`relative bg-[#383434] rounded-2xl shadow-2xl border-4 border-[#383434] transition-all duration-200 min-w-[250px] ${isProcessing ? ' border-4 border-white' : ''}`}
    >
      <Handle {...OUTPUT_HANDLE_PROPS} />
      <Handle {...INPUT_HANDLE_PROPS} />

      <div className='px-4 pb-3'>
        <FileDropdown
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          files={availableFiles}
        />
      </div>
    </div>
  );
};

export default FileInputNodeComponent;
