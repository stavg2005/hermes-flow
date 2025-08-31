import { ClientData } from '@/features/nodes/types/NodeData';
import { Trash2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
interface ClientItemProps {
  client: ClientData;
  onUpdate: (updates: Partial<ClientData>) => void;
  onRemove: () => void;
}
const ClientIcon = () => (
  <svg
    className='w-8 h-8 text-gray-300'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
  >
    <circle cx='12' cy='12' r='10' />
    <circle cx='12' cy='12' r='6' />
    <circle cx='12' cy='10' r='2' />
    <path d='M8 17c0-2 2-3 4-3s4 1 4 3' />
  </svg>
);

const ClientItem = memo<ClientItemProps>(({ client, onUpdate, onRemove }) => {
  const [localIP, setLocalIP] = useState(client.ip);
  const [localPort, setLocalPort] = useState(client.port);

  const handleIPSubmit = useCallback(() => {
    if (localIP !== client.ip) {
      onUpdate({ ip: localIP });
    }
  }, [localIP, client.ip, onUpdate]);

  const handlePortSubmit = useCallback(() => {
    if (localPort !== client.port) {
      onUpdate({ port: localPort });
    }
  }, [localPort, client.port, onUpdate]);

  return (
    <div className='flex items-center gap-3 w-full'>
      <div className='flex-shrink-0 p-2 rounded-lg border-2 border-gray-500'>
        <ClientIcon />
      </div>

      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-white text-sm font-medium w-8'>IP</span>
          <input
            value={localIP}
            onChange={e => setLocalIP(e.target.value)}
            onBlur={handleIPSubmit}
            onKeyDown={e => e.key === 'Enter' && handleIPSubmit()}
            className='bg-[#2a2626] px-2 py-1 rounded text-white text-sm font-mono flex-1'
            placeholder='127.0.0.1'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-white text-sm font-medium w-8'>Port</span>
          <input
            value={localPort}
            onChange={e => setLocalPort(e.target.value)}
            onBlur={handlePortSubmit}
            onKeyDown={e => e.key === 'Enter' && handlePortSubmit()}
            className='bg-[#2a2626] px-2 py-1 rounded text-white text-sm font-mono flex-1'
            placeholder='8000'
          />
        </div>
      </div>

      <button
        onClick={onRemove}
        className='flex-shrink-0 p-2 rounded-lg border-2 border-red-400 hover:bg-red-500/20 text-red-400'
        title='Remove client'
      >
        <Trash2 />
      </button>
    </div>
  );
});

export default ClientItem;
