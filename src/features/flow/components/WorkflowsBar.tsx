import { useState, useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { FC } from 'react';

const mock_workflows: string[] = [
  "Example 1",
  "Example 2",
  "Example 3"
]

interface WorkflowBarProps {
  onClose: () => void;
}

const WorkflowBar: FC<WorkflowBarProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      // Handle the JSON file here
      console.log('Selected file:', file);
      // You can read the file content here
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = JSON.parse(e.target?.result as string);
          console.log('JSON content:', jsonContent);
          // Process your JSON file here
        } catch (error) {
          console.error('Invalid JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
    setShowFileUpload(false);
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-50vh min-w-200 bg-[#1b333c]/50 backdrop-blur-md text-white p-8 fixed z-1213132 top-0 rounded-3xl left-200 fixed">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header with numbered tabs */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => setActiveTab(num)}
            className={`text-2xl font-bold ${activeTab === num ? 'text-white' : 'text-slate-500'
              } hover:text-white transition-colors`}
          >
            {num}
          </button>
        ))}
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white text-2xl">
          ✕
        </button>
      </div>

      {/* Main content grid */}
      <div className={`grid grid-cols-3 gap-6 ${showFileUpload ? 'filter blur-sm' : ''}`}>
        {mock_workflows.map((workflow, index) => {
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-[#433e3e] rounded-lg p-4 h-44 w-80 flex items-center justify-center">
              </div>
              <p className="text-sm font-medium italic text-white mt-2">
                {workflow}
              </p>
            </div>
          );
        })}

        {/* Plus button */}
        <button
          onClick={() => setShowFileUpload(true)}
          className="bg-[#433e3e] rounded-lg h-44 w-80 flex items-center justify-center hover:bg-slate-500 transition-colors"
        >
          <Plus className="w-24 h-24 text-white" />
        </button>
      </div>

      {/* File Upload Modal Overlay - More transparent background */}
      {showFileUpload && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50 bg-black/20"
          onClick={() => setShowFileUpload(false)}
        >
          <div
            className="border-2 border-dashed border-white rounded-lg p-20 bg-slate-800/50 backdrop-blur-sm cursor-pointer hover:bg-slate-800/60 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              openFileExplorer();
            }}
          >
            <div className="text-4xl font-bold mb-8 italic text-white">
              drop json file
            </div>
            <Upload className="w-16 h-16 mx-auto mb-6 text-white" />
            <div className="text-sm text-white italic text-center">
              or click here to browse files
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowBar;
