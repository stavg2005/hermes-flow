import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';
import { GraphTraversalService } from './GraphTraversalService';
import { ProcessorRegistry } from './ProcessorRegistry';

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
  }

  static async processFileInputs(
    nodes: CustomNode[],
    signal: AbortSignal
  ): Promise<void> {
    const fileInputNodes = nodes.filter(node => node.type === 'fileInputs');

    const promises = fileInputNodes.map(node =>
      ProcessorRegistry.executeProcess(
        node.type as string,
        node.id,
        node.data,
        signal
      )
    );

    await Promise.all(promises);
  }

  static async executeNodeProcessing(
    nodes: CustomNode[],
    edges: CustomEdge[],
    signal: AbortSignal,
    onNodeChange: (nodeId: string) => void
  ): Promise<void> {
    const startNode = GraphTraversalService.findStartNode(nodes, edges)!;
    let currentNodeId: string | null = startNode.id;

    while (currentNodeId && !signal.aborted) {
      onNodeChange(currentNodeId);

      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      try {
        await ProcessorRegistry.executeProcess(
          node.type as string,
          node.id,
          node.data,
          signal
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
        throw new Error(`Processing failed at node ${node.id}: ${error}`);
      }

      currentNodeId = GraphTraversalService.getNextNode(currentNodeId, edges);
    }
  }
}
