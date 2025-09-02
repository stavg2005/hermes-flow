import { FileInputNodeData, } from '@/features/nodes/types/NodeData';
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import FileDropdown from './FileDropdown';
import { useOptions } from './hooks/useOptions';

const MOCK_FILES = [
  'test1.wav',
  'test2.wav',
  'test3.wav',
  'test4.wav',
  'test5.wav',
];

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

const FileInputNodeComponent: React.FC<NodeProps> = ({ id }) => {
  const [selectedFile, setSelectedFile] = useState('');
  const { updateNodeData } = useReactFlow();
  const recivedData = useOptions(id);
  const handleFileSelect = useCallback(
    (file: string) => {
      setSelectedFile(file);

      const nodeData: FileInputNodeData = {
        filePath: file,
        fileName: file,
        options: { gain: 1 }, // stupid for now
      };

      updateNodeData(id, nodeData);
    },
    [id, updateNodeData]
  );

  useEffect(() => {
    if (recivedData) {
      console.log("options data" + recivedData);
    }
  }, [recivedData])

  return (
    <div className='relative bg-[#383434] rounded-2xl shadow-2xl border-4 border-[#383434] transition-all duration-200 min-w-[250px]'>
      <Handle {...OUTPUT_HANDLE_PROPS} />

      <Handle {...INPUT_HANDLE_PROPS} />
      <div className='px-4 pt-3 pb-2'>
        <h3 className='text-white font-bold italic font-inter text-sm'>
          File Input
        </h3>
      </div>

      <div className='px-4 pb-3'>
        <FileDropdown
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          files={MOCK_FILES}
        />
      </div>
    </div>
  );
};

export default FileInputNodeComponent;
