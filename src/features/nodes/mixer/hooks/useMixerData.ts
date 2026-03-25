import {
  FileOptionsNodeData,
  MixerNodeData,
} from '@/features/nodes/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';

export const useMixerData = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });

  // OPTIMIZATION 1: Memoize the array of source IDs so useNodesData doesn't thrash
  const sourceIds = useMemo(
    () => connections.map(connection => connection.source),
    [connections]
  );

  const connectedNodesData = useNodesData(sourceIds);
  const { updateNodeData } = useReactFlow();

  const processedData = useMemo(() => {
    if (!connectedNodesData) return [];

    // Defensive check: ensure we are iterating over an array
    const nodesArray = Array.isArray(connectedNodesData)
      ? connectedNodesData
      : [connectedNodesData];

    const fileInputNodes = nodesArray.filter(
      nodeData => nodeData?.type === 'fileInput'
    );

    return fileInputNodes.map(nodeData => ({
      filePath: (nodeData.data?.filePath as string) || '',
      fileName: (nodeData.data?.fileName as string) || '',
      options: (nodeData.data?.options as FileOptionsNodeData) || {},
    }));
  }, [connectedNodesData]);

  // OPTIMIZATION 2: Deep compare before dispatching to prevent infinite render loops
  const prevDataRef = useRef<string>('');

  useEffect(() => {
    const dataString = JSON.stringify(processedData);

    if (prevDataRef.current !== dataString) {
      prevDataRef.current = dataString;

      const mixerData: MixerNodeData = {
        files: processedData,
      };
      updateNodeData(nodeId, mixerData);
    }
  }, [processedData, nodeId, updateNodeData]);

  return processedData;
};
