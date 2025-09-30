import { GetIsRunning, useAppSelector } from '@/app/store';
import { NodeProps } from '@xyflow/react';
import { ClientData } from '../types/NodeData.ts';
import { AddClientButton } from './AddClientButton';
import ClientItem from './ClientItem';
import { useClientsData } from './hooks/useClientsData';
const ClientsNode: React.FC<NodeProps> = ({ id, data }) => {
  const { clients, addClient, updateClient, removeClient } = useClientsData(
    id,
    data
  );
  const isProcessing = useAppSelector(GetIsRunning);
  return (
    <div className='bg-[#373333] rounded-2xl p-4 w-[300px]'>
      <div className='text-center mb-4'>
        <h2 className='text-white text-2xl font-bold italic font-sans'>
          Clients
        </h2>
      </div>

      <div className='space-y-3'>
        {clients.map((client: ClientData) => (
          <ClientItem
            key={client.id}
            client={client}
            onUpdate={updates => updateClient(client.id, updates)}
            onRemove={() => removeClient(client.id)}
            isProcessing={isProcessing}
          />
        ))}

        <AddClientButton onClick={addClient} disabled={isProcessing} />
      </div>
    </div>
  );
};
export default ClientsNode;
