import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';

export const GraphTraversalService = {
  findStartNode(nodes: CustomNode[], edges: CustomEdge[]): CustomNode | null {
    // Find fileInput nodes that have NO outgoing edges to mixers
    const startFileInputs = nodes
      .filter(node =>
        node.type === 'fileInput' &&
        !this.isConnectedToMixer(node.id, edges, nodes)
      )
      .sort((a, b) => {
        // Sort by Y first (top), then by X (left)
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    // If we found valid fileInputs, return the top-leftmost
    if (startFileInputs.length > 0) {
      return startFileInputs[0];
    }

    // Find top-leftmost mixer node with incoming edges
    const mixerNodes = nodes
      .filter(node => node.type === 'mixer' && this.hasIncomingEdges(node.id, edges))
      .sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    // Find top-leftmost delay node without incoming edges
    const delayNodes = nodes
      .filter(node => node.type === 'delay' && !this.hasIncomingEdges(node.id, edges))
      .sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

    // Return in priority order: fileInput → mixer → delay
    return startFileInputs[0] || mixerNodes[0] || delayNodes[0] || null;
  },
  isConnectedToMixer(nodeId: string, edges: CustomEdge[], nodes: CustomNode[]): boolean {
    return edges.some(edge =>
      edge.source === nodeId &&
      nodes.find(node => node.id === edge.target && node.type === 'mixer')
    );
  },
  hasIncomingEdgesFromDelay(nodeId: string, edges: CustomEdge[], nodes: CustomNode[]): boolean {
    return edges.some(edge =>
      edge.target === nodeId &&
      nodes.find(node => node.id === edge.source && node.type === 'delay')
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
