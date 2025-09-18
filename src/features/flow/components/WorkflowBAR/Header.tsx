import { FC } from 'react';
interface HeaderProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  onClose: () => void;
}

const Header: FC<HeaderProps> = ({ activeTab, onTabChange, onClose }) => (
  <div className='flex items-center gap-4 mb-6 md:mb-8'>
    {[1, 2, 3, 4].map(num => (
      <button
        key={num}
        onClick={() => onTabChange(num)}
        className={`text-xl md:text-2xl font-bold ${
          activeTab === num ? 'text-white' : 'text-slate-500'
        } hover:text-white transition-colors`}
      >
        {num}
      </button>
    ))}
    <button
      onClick={onClose}
      className='ml-auto text-slate-400 hover:text-white text-xl md:text-2xl'
    >
      ✕
    </button>
  </div>
);

export default Header;
