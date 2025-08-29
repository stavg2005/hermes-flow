// components/sidebar/SidebarItem.tsx
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  nodeType: string;
  isActive?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  nodeType,
  isActive = false,
}) => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

    // Add visual feedback using CSS classes
    event.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('dragging');
  };

  return (
    <div
      className={`
        sidebar-item w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200
        hover:bg-[#255263] cursor-grab active:cursor-grabbing
        ${isActive ? 'bg-slate-600/40 text-white' : 'text-slate-300'}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role='button'
      tabIndex={0}
      aria-label={`Drag ${label} node to canvas`}
    >
      <div className='w-10 h-10 flex items-center justify-center bg-[#0d141c] rounded-lg shrink-0'>
        {icon}
      </div>
      <span className='text-base font-normal truncate'>{label}</span>
    </div>
  );
};

export default SidebarItem;
