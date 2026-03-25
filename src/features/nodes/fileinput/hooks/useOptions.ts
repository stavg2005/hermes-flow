import {
  FileInputNodeData,
  FileOptionsNodeData,
} from '@/features/nodes/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useEffect, useMemo, useRef } from 'react';

export const useOptions = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });

  // OPTIMIZATION 1: Memoize source IDs
  const sourceIds = useMemo(
    () => connections.map(connection => connection.source),
    [connections]
  );

  const connectedNodesData = useNodesData(sourceIds);
  const { updateNodeData } = useReactFlow();

  const processedData = useMemo(() => {
    if (!connectedNodesData) return null;

    const nodesArray = Array.isArray(connectedNodesData)
      ? connectedNodesData
      : [connectedNodesData];

    const fileOptionsNode = nodesArray.find(
      nodeData => nodeData?.type === 'fileOptions'
    );

    if (!fileOptionsNode) return null;

    return {
      gain: (fileOptionsNode.data?.gain as number) ?? 1,
    };
  }, [connectedNodesData]);

  // OPTIMIZATION 2: Compare specific values before dispatch
  const prevGainRef = useRef<number | null>(null);

  useEffect(() => {
    if (processedData && prevGainRef.current !== processedData.gain) {
      prevGainRef.current = processedData.gain;

      const fileInputData: Partial<FileInputNodeData> = {
        options: processedData as FileOptionsNodeData,
      };
      updateNodeData(nodeId, fileInputData);
    }
  }, [processedData, nodeId, updateNodeData]);

  return processedData;
};
