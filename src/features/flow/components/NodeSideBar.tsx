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
    <div className=' fixed p-1 top-60 min-h-fit max-h-[80vh] scale-120 ml-10 w-54 bg-[#1b333c]/50 backdrop-blur-md rounded-2xl border border-slate-700/50 z-40 overflow-y-auto'>
      <div className='p-5 position-relative '>
        <img src='/media/logo.png' alt='Hermes Logo' className='w-45 h-25 ' />
      </div>

      <div className=''>
        <div className='space-y-1'>
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
