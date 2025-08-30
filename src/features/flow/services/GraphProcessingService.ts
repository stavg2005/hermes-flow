// services/GraphProcessingService.ts
import { graphProcessingActions } from '@/store/slices/graphProcessingSlice';
import { store } from '@/store/store';
import { CustomEdge, CustomNode } from '@/types/types';
import { ProcessorRegistry } from './ProcessorRegistry';
export class GraphProcessingService {
  private static instance: GraphProcessingService;
  private abortController: AbortController | null = null;
  private isProcessing = false;

  static getInstance(): GraphProcessingService {
    if (!this.instance) {
      this.instance = new GraphProcessingService();
    }
    return this.instance;
  }

  async startProcessing(): Promise<void> {
    console.log('in startProcessing service');
    if (this.isProcessing) {
      throw new Error('Processing already in progress');
    }

    this.isProcessing = true;
    this.abortController = new AbortController();

    try {
      store.dispatch(graphProcessingActions.startProcessing());

      const { nodes, edges } = store.getState().flow;
      await this.processGraph(nodes, edges, this.abortController.signal);

      store.dispatch(graphProcessingActions.completeProcessing());
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        store.dispatch(graphProcessingActions.stopProcessing());
      } else {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        store.dispatch(graphProcessingActions.setError(errorMessage));
      }
    } finally {
      this.isProcessing = false;
      this.abortController = null;
    }
  }

  stopProcessing(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async processGraph(
    nodes: CustomNode[],
    edges: CustomEdge[],
    signal: AbortSignal
  ): Promise<void> {
    const startNode = this.findStartNode(nodes, edges);
    let currentNodeId = startNode?.id;

    while (currentNodeId && !signal.aborted) {
      store.dispatch(graphProcessingActions.setCurrentNode(currentNodeId));

      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      await ProcessorRegistry.executeProcess(
        node.type as string,
        node.id,
        node.data,
        signal
      );

      currentNodeId = this.getNextNode(currentNodeId, edges);
    }
  }

  private findStartNode(nodes: CustomNode[], edges: CustomEdge[]) {
    return nodes.find(
      node =>
        (node.type === 'delay' && !this.hasIncomingEdges(node.id, edges)) ||
        (node.type === 'mixer' && this.hasIncomingEdges(node.id, edges))
    );
  }

  private hasIncomingEdges(nodeId: string, edges: CustomEdge[]): boolean {
    return edges.some(edge => edge.target === nodeId);
  }

  private getNextNode(
    currentNodeId: string,
    edges: CustomEdge[]
  ): string | undefined {
    const edge = edges.find(e => e.source === currentNodeId);
    return edge?.target;
  }
}
