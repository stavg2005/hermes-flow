import { ClientData } from '@/features/nodes/types/NodeData';
import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { GraphTraversalService } from './GraphTraversalService';

export class GraphProcessingService {
  static validateGraph(nodes: CustomNode[], edges: CustomEdge[]): void {
    const startNode = GraphTraversalService.findStartNode(nodes, edges);
    if (!startNode) {
      throw new Error('No start node found');
    }

    const clients = nodes.find(node => node.type === 'clients');
    if (!clients) {
      throw new Error('No clients found');
    }
    const clientsArray = (clients.data?.clients as ClientData[]) || null;
    if (!clientsArray || clientsArray.length === 0) {
      throw new Error('Clients have no data');
    }
    for (const client of clientsArray) {
      if (!client.ip.length || !client.port.length)
        throw new Error('One or more clients are missing data');
    }
  }
}
