// useAvailableFiles.ts
import { useReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';

const MOCK_FILES = [
  'test1.wav',
  'test2.wav',
  'test3.wav',
  'test4.wav',
  'test5.wav',
];

// Alternative: Use a global event emitter approach
class FlowUpdateEmitter {
  private listeners: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit() {
    this.listeners.forEach(callback => callback());
  }
}

const flowUpdateEmitter = new FlowUpdateEmitter();

// Call this whenever you make changes to the flow
export const notifyFlowUpdate = () => {
  flowUpdateEmitter.emit();
};

export const useAvailableFilesWithEmitter = (
  nodeId: string,
  currentFile: string
) => {
  const { getNodes, getEdges } = useReactFlow();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = flowUpdateEmitter.subscribe(() => {
      console.log(
        '📡 Received flow update notification for node:',
        nodeId.slice(-4)
      );
      forceUpdate({});
    });

    return unsubscribe;
  }, [nodeId]);

  const nodes = getNodes();
  const edges = getEdges();

  const outgoingEdges = edges.filter(edge => edge.source === nodeId);
  const connectedMixers = outgoingEdges
    .map(edge => nodes.find(node => node.id === edge.target))
    .filter(
      (node): node is NonNullable<typeof node> =>
        node !== undefined && node.type === 'mixer'
    );

  const usedFiles = new Set<string>();

  for (const mixer of connectedMixers) {
    const mixerIncomingEdges = edges.filter(edge => edge.target === mixer.id);
    const connectedFileNodes = mixerIncomingEdges
      .map(edge => nodes.find(node => node.id === edge.source))
      .filter(
        (node): node is NonNullable<typeof node> =>
          node !== undefined && node.type === 'fileInput' && node.id !== nodeId
      );

    for (const node of connectedFileNodes) {
      const fileName = node.data?.fileName;
      if (
        typeof fileName === 'string' &&
        fileName.length > 0 &&
        fileName !== 'unknown'
      ) {
        usedFiles.add(fileName);
      }
    }
  }

  const availableFiles = MOCK_FILES.filter(file => !usedFiles.has(file));

  return availableFiles;
};
