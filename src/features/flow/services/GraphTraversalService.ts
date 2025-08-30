import { CustomEdge, CustomNode } from '@/types/types';

export const GraphTraversalService = {
  findStartNode(nodes: CustomNode[], edges: CustomEdge[]): CustomNode | null {
    return (
      nodes.find(
        node =>
          (node.type === 'delay' && !this.hasIncomingEdges(node.id, edges)) ||
          (node.type === 'mixer' && this.hasIncomingEdges(node.id, edges))
      ) || null
    );
  },

  hasIncomingEdges(nodeId: string, edges: CustomEdge[]): boolean {
    return edges.some(edge => edge.target === nodeId);
  },

  getNextNode(currentNodeId: string, edges: CustomEdge[]): string | null {
    const edge = edges.find(e => e.source === currentNodeId);
    return edge?.target || null;
  },
};
