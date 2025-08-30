import { useClientsData } from './hooks/useClientsData';
import { ClientData } from '../types/NodeData.ts';
import { NodeProps } from '@xyflow/react';
import { AddClientButton } from './AddClientButton';
import ClientItem from './ClientItem';
const ClientsNode: React.FC<NodeProps> = ({ id }) => {
  const { clients, addClient, updateClient, removeClient } = useClientsData(id);

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
          />
        ))}

        <AddClientButton onClick={addClient} />
      </div>
    </div>
  );
};
export default ClientsNode;
