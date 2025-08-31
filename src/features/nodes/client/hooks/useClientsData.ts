import { ClientData } from '@/features/nodes/types/NodeData';
import { useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useCallback, useState } from 'react';

export const useClientsData = (nodeId: string) => {
  const { updateNodeData } = useReactFlow();
  const [clients, setClients] = useState<ClientData[]>([]);

  const updateNodeClients = useCallback(
    (newClients: ClientData[]) => {
      setClients(newClients);
      updateNodeData(nodeId, { clients: newClients });
    },
    [nodeId, updateNodeData]
  );

  const addClient = useCallback(() => {
    const newClient: ClientData = {
      id: nanoid(),
      name: `Client ${clients.length + 1}`,
      ip: '',
      port: '',
      isSelected: false,
    };
    updateNodeClients([...clients, newClient]);
  }, [clients, updateNodeClients]);

  const updateClient = useCallback(
    (clientId: string, updates: Partial<ClientData>) => {
      const updatedClients = clients.map(client =>
        client.id === clientId ? { ...client, ...updates } : client
      );
      updateNodeClients(updatedClients);
    },
    [clients, updateNodeClients]
  );

  const removeClient = useCallback(
    (clientId: string) => {
      const filteredClients = clients.filter(client => client.id !== clientId);
      updateNodeClients(filteredClients);
    },
    [clients, updateNodeClients]
  );

  return { clients, addClient, updateClient, removeClient };
};
