import { CustomEdge, CustomNode } from '@/features/nodes/types/nodes';

interface StartNodeCandidate {
  node: CustomNode;
  priority: number;
}

export const GraphTraversalService = {
  findStartNode(nodes: CustomNode[], edges: CustomEdge[]): CustomNode | null {
    const validStartNodes = this.collectValidStartNodes(nodes, edges);

    if (validStartNodes.length === 0) {
      return null;
    }

    // Create a copy and sort to avoid mutating the original array
    const topLeft = validStartNodes.reduce((best, current) => {
      const bestDistance = best.position.x + best.position.y;
      const currentDistance = current.position.x + current.position.y;
      return currentDistance < bestDistance ? current : best;
    });
    return topLeft;
  },

  /**
   * Collects all valid start nodes based on node type and connection rules
   */
  collectValidStartNodes(
    nodes: CustomNode[],
    edges: CustomEdge[]
  ): CustomNode[] {
    const candidates: StartNodeCandidate[] = [
      ...this.findValidFileInputNodes(nodes, edges),
      ...this.findValidMixerNodes(nodes, edges),
      ...this.findValidDelayNodes(nodes, edges),
    ];

    return candidates.map(candidate => candidate.node);
  },

  /**
   * Find fileInput nodes that are not connected to mixers but have outgoing edges
   */
  findValidFileInputNodes(
    nodes: CustomNode[],
    edges: CustomEdge[]
  ): StartNodeCandidate[] {
    return nodes
      .filter(node => node.type === 'fileInput')
      .filter(
        node =>
          !this.isConnectedToMixer(node.id, edges, nodes) &&
          this.hasOutgoingEdges(node.id, edges)
      )
      .map(node => ({ node, priority: 1 }));
  },

  /**
   * Find mixer nodes with both incoming and outgoing edges
   */
  findValidMixerNodes(
    nodes: CustomNode[],
    edges: CustomEdge[]
  ): StartNodeCandidate[] {
    return nodes
      .filter(node => node.type === 'mixer')
      .filter(
        node =>
          this.hasIncomingEdges(node.id, edges) &&
          this.hasOutgoingEdges(node.id, edges)
      )
      .map(node => ({ node, priority: 2 }));
  },

  /**
   * Find delay nodes without incoming edges but with outgoing edges
   */
  findValidDelayNodes(
    nodes: CustomNode[],
    edges: CustomEdge[]
  ): StartNodeCandidate[] {
    return nodes
      .filter(node => node.type === 'delay')
      .filter(
        node =>
          !this.hasIncomingEdges(node.id, edges) &&
          this.hasOutgoingEdges(node.id, edges)
      )
      .map(node => ({ node, priority: 3 }));
  },

  /**
   * Compares two nodes by position (top-left first)
   */
  compareNodePositions(a: CustomNode, b: CustomNode): number {
    // Sort by Y first (top), then by X (left)
    const yDiff = a.position.y - b.position.y;
    if (yDiff !== 0) {
      return yDiff;
    }
    return a.position.x - b.position.x;
  },

  /**
   * Checks if a node is connected to any mixer node
   */
  isConnectedToMixer(
    nodeId: string,
    edges: CustomEdge[],
    nodes: CustomNode[]
  ): boolean {
    const mixerNodeIds = new Set(
      nodes.filter(node => node.type === 'mixer').map(node => node.id)
    );

    return edges.some(
      edge => edge.source === nodeId && mixerNodeIds.has(edge.target)
    );
  },

  /**
   * Checks if a node has incoming edges from delay nodes
   */
  hasIncomingEdgesFromDelay(
    nodeId: string,
    edges: CustomEdge[],
    nodes: CustomNode[]
  ): boolean {
    const delayNodeIds = new Set(
      nodes.filter(node => node.type === 'delay').map(node => node.id)
    );

    return edges.some(
      edge => edge.target === nodeId && delayNodeIds.has(edge.source)
    );
  },

  /**
   * Checks if a node has any incoming edges
   */
  hasIncomingEdges(nodeId: string, edges: CustomEdge[]): boolean {
    return edges.some(edge => edge.target === nodeId);
  },

  /**
   * Checks if a node has any outgoing edges
   */
  hasOutgoingEdges(nodeId: string, edges: CustomEdge[]): boolean {
    return edges.some(edge => edge.source === nodeId);
  },

  /**
   * Gets the next node in the traversal path
   */
  getNextNode(currentNodeId: string, edges: CustomEdge[]): string | null {
    const edge = edges.find(e => e.source === currentNodeId);
    return edge?.target ?? null;
  },

  /**
   * Gets all nodes connected to the given node
   */
  getConnectedNodes(nodeId: string, edges: CustomEdge[]): string[] {
    return edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
  },

  /**
   * Validates if a traversal path exists from start to end
   */
  hasPath(
    startNodeId: string,
    endNodeId: string,
    edges: CustomEdge[]
  ): boolean {
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === endNodeId) {
        return true;
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);
      const connectedNodes = this.getConnectedNodes(currentId, edges);
      queue.push(...connectedNodes);
    }

    return false;
  },

  /**
   * Gets all reachable nodes from a starting node
   */
  getReachableNodes(startNodeId: string, edges: CustomEdge[]): Set<string> {
    const reachable = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (reachable.has(currentId)) {
        continue;
      }

      reachable.add(currentId);
      const connectedNodes = this.getConnectedNodes(currentId, edges);
      queue.push(...connectedNodes);
    }

    return reachable;
  },
};
