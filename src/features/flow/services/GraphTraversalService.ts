import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';

export const GraphTraversalService = {
  findStartNode(nodes: CustomNode[], edges: CustomEdge[]): CustomNode | null {
    // Collect all valid start nodes
    const validStartNodes: CustomNode[] = [];

    // Find fileInput nodes that:
    // - have NO outgoing edges to mixers
    // - have at least one outgoing edge
    const startFileInputs = nodes.filter(node =>
      node.type === 'fileInput' &&
      !this.isConnectedToMixer(node.id, edges, nodes) &&
      this.hasOutgoingEdges(node.id, edges)
    );
    validStartNodes.push(...startFileInputs);

    // Find mixer nodes with incoming edges and outgoing edges
    const mixerNodes = nodes.filter(node =>
      node.type === 'mixer' &&
      this.hasIncomingEdges(node.id, edges) &&
      this.hasOutgoingEdges(node.id, edges)
    );
    validStartNodes.push(...mixerNodes);

    // Find delay nodes without incoming edges but with outgoing edges
    const delayNodes = nodes.filter(node =>
      node.type === 'delay' &&
      !this.hasIncomingEdges(node.id, edges) &&
      this.hasOutgoingEdges(node.id, edges)
    );
    validStartNodes.push(...delayNodes);

    // Sort ALL valid start nodes by top-left position and return the first one
    return validStartNodes
      .sort((a, b) => {
        // Sort by Y first (top), then by X (left)
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      })[0] || null;
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
  hasOutgoingEdges(nodeId: string, edges: CustomEdge[]): boolean {
    return edges.some(edge => edge.source === nodeId);
  },
  getNextNode(currentNodeId: string, edges: CustomEdge[]): string | null {
    const edge = edges.find(e => e.source === currentNodeId);
    return edge?.target || null;
  },
};
