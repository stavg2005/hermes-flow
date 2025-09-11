import { memo, useCallback } from 'react';
import { useDropdown } from './hooks/useDropdown.ts';

interface FileDropdownProps {
  selectedFile: string;
  onFileSelect: (file: string) => void;
  files: string[];
  isLoading?: boolean;
}

const FileDropdown = memo<FileDropdownProps>(
  ({ selectedFile, onFileSelect, files, isLoading = false }) => {
    const { isOpen, setIsOpen, dropdownRef } = useDropdown();

    const handleFileSelect = useCallback(
      (file: string) => {
        onFileSelect(file);
        setIsOpen(false);
      },
      [onFileSelect, setIsOpen]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent, file: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleFileSelect(file);
        }
      },
      [handleFileSelect]
    );

    return (
      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className='flex items-center justify-between w-full px-3 py-2 bg-[#221C1C] text-white rounded-xl font-medium italic font-inter text-sm transition-all duration-200 hover:bg-[#2a2424] focus:outline-none focus:ring-2 focus:ring-[#709DFF] disabled:opacity-50'
          aria-expanded={isOpen}
          aria-haspopup='listbox'
          aria-label={
            selectedFile ? `Selected file: ${selectedFile}` : 'Choose file'
          }
        >
          <span className='truncate'>
            {isLoading ? 'Loading...' : selectedFile || 'Choose file'}
          </span>

          {/* Debug info - remove this later */}
          <span className='text-xs text-gray-400 ml-2'>({files.length})</span>

          <svg
            className={`w-4 h-4 ml-2 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className='absolute top-full left-0 right-0 mt-1 bg-[#221C1C] rounded-xl shadow-xl border border-[#383434] overflow-hidden z-50 max-h-60 overflow-y-auto'
            role='listbox'
            aria-label='File selection'
          >
            <div className='py-1'>
              {/* Debug info */}
              <div className='px-3 py-1 text-xs text-gray-500 border-b border-gray-600'>
                Available: {files.length} files
              </div>

              {files.map((file, index) => (
                <button
                  key={`${file}-${index}`} // Use index to ensure uniqueness
                  onClick={() => handleFileSelect(file)}
                  onKeyDown={e => handleKeyDown(e, file)}
                  className='block w-full text-left px-3 py-2 text-white font-medium italic font-inter text-sm transition-all duration-150 hover:bg-[#383434] focus:bg-[#383434] focus:outline-none'
                  role='option'
                  aria-selected={selectedFile === file}
                >
                  <span className='truncate'>{file}</span>
                </button>
              ))}

              {files.length === 0 && (
                <div className='px-3 py-2 text-gray-400 text-sm'>
                  No files available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileDropdown.displayName = 'FileDropdown';
export default FileDropdown;
