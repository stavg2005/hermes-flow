import { Upload } from 'lucide-react';
import { FC } from 'react';
import { useFileUploadModal } from '../hooks/useFileUploadModal';
interface FileUploadModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const FileUploadModal: FC<FileUploadModalProps> = ({ isVisible, onClose }) => {
  const {
    isUploading,
    isDragOver,
    fileInputRef,
    handleFileSelect,
    openFileExplorer,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  } = useFileUploadModal(onClose);
  if (!isVisible) return null;

  return (
    <>
      <input
        type='file'
        ref={fileInputRef}
        accept='.json'
        onChange={handleFileSelect}
        className='hidden'
      />

      <div
        className='absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm rounded-3xl'
        onClick={isUploading ? undefined : onClose} // ✅ Don't close while uploading
      >
        <button
          className={`border-2 border-dashed rounded-lg p-8 md:p-20 backdrop-blur-sm transition-all duration-200 mx-4 max-w-md w-full focus:outline-none focus:ring-2 focus:ring-white/50 ${
            isDragOver
              ? 'border-green-400 bg-green-900/30 scale-105'
              : 'border-white bg-slate-800/70 hover:bg-slate-800/80'
          } ${isUploading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
          onClick={e => {
            e.stopPropagation();
            if (!isUploading) {
              openFileExplorer();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          type='button'
          aria-label='Upload JSON file'
          disabled={isUploading}
        >
          {isUploading ? (
            <div className='text-center'>
              <div className='text-2xl md:text-4xl font-bold mb-4 text-white animate-pulse'>
                Uploading...
              </div>
              <Upload className='w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white animate-bounce' />
            </div>
          ) : (
            <>
              <div
                className={`text-2xl md:text-4xl font-bold mb-4 md:mb-8 italic text-center transition-colors ${
                  isDragOver ? 'text-green-300' : 'text-white'
                }`}
              >
                {isDragOver ? 'drop it now!' : 'drop json file'}
              </div>
              <Upload
                className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 transition-colors ${
                  isDragOver ? 'text-green-300' : 'text-white'
                }`}
              />
              <div
                className={`text-sm italic text-center transition-colors ${
                  isDragOver ? 'text-green-300' : 'text-white'
                }`}
              >
                {isDragOver
                  ? 'release to upload'
                  : 'or click here to browse files'}
              </div>
            </>
          )}
        </button>
      </div>
    </>
  );
};
export default FileUploadModal;
