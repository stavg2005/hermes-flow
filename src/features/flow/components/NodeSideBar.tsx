import {
  Clock,
  GitCompareArrowsIcon,
  Mic,
  SlidersHorizontal,
  UserIcon,
} from 'lucide-react';
import React from 'react';
import SidebarItem from './SideBarItem';

// Main Sidebar Component
interface SidebarProps {
  activeItem?: string;
}

const NodeLibrarySidebar: React.FC<SidebarProps> = ({ activeItem }) => {
  const sidebarItems = [
    {
      id: 'file-input',
      nodeType: 'fileInput',
      icon: <Mic className='w-5 h-5' />,
      label: 'File Input',
    },
    {
      id: 'mixer',
      nodeType: 'mixer',
      icon: <SlidersHorizontal className='w-5 h-5' />,
      label: 'Mixer',
    },
    {
      id: 'delay',
      nodeType: 'delay',
      icon: <Clock className='w-5 h-5' />,
      label: 'Delay',
    },
    {
      id: 'clients',
      nodeType: 'clients',
      icon: <UserIcon className='w-5 h-5' />,
      label: 'clients',
    },
    {
      id: 'fileOptions',
      nodeType: 'fileOptions',
      icon: <GitCompareArrowsIcon className='w-5 h-5' />,
      label: 'fileOptions',
    },
  ];

  return (
    <div className='absolute left-4 top-1/2 -translate-y-1/2 min-h-fit max-h-[80vh] w-64 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-700/50 z-40 overflow-y-auto flex flex-col p-2 shadow-2xl transition-all'>
      <div className='p-4 mb-2 mt-2 flex justify-center'>
        <img src='/media/logo.png' alt='Hermes Logo' className='w-40 h-auto object-contain' />
      </div>

      <div className='px-2 pb-2'>
        <div className='space-y-2'>
          {sidebarItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label || 'start'}
              nodeType={item.nodeType}
              isActive={activeItem === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeLibrarySidebar;
