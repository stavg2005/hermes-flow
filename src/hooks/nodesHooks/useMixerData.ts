import {
  FileInputNodeData,
  FileOptionsNodeData,
  MixerNodeData,
} from '@/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export const useMixerData = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });
  const connectedNodesData = useNodesData(
    connections.map(connection => connection.source)
  );
  const { updateNodeData } = useReactFlow();

  // Track previous data to prevent unnecessary updates
  const previousDataRef = useRef<string>('');

  const processedData = useMemo(() => {
    const fileInputNodes = connectedNodesData.filter(
      nodeData => nodeData?.type === 'fileInput'
    );

    return fileInputNodes.map(nodeData => ({
      filePath: (nodeData.data?.filePath as string) || '',
      fileName: (nodeData.data?.fileName as string) || '',
      options: (nodeData.data?.options as FileOptionsNodeData) || {},
    }));
  }, [connectedNodesData]);

  // Stable update function
  const updateMixerData = useCallback(
    (data: FileInputNodeData[]) => {
      const mixerData: MixerNodeData = {
        files: data,
      };
      updateNodeData(nodeId, mixerData);
    },
    [nodeId, updateNodeData]
  );

  //Only update when actual connection data changes
  useEffect(() => {
    const currentDataSerialized = JSON.stringify(
      connections.map(conn => conn.source)
    );

    if (currentDataSerialized !== previousDataRef.current) {
      updateMixerData(processedData);
      previousDataRef.current = currentDataSerialized;
    }
  }, [connections, processedData, updateMixerData]);

  return processedData;
};
