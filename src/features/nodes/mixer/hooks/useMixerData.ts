import {
  FileInputNodeData,
  FileOptionsNodeData,
  MixerNodeData,
} from '@/features/nodes/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo } from 'react';

export const useMixerData = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });
  const connectedNodesData = useNodesData(
    connections.map(connection => connection.source)
  );

  const { updateNodeData: updateNodeDataReactFlow } = useReactFlow();

  const processedData = useMemo(() => {
    console.log(
      'broooo i got updated with ' + JSON.stringify(connectedNodesData)
    );
    const fileInputNodes = connectedNodesData.filter(
      nodeData => nodeData?.type === 'fileInput'
    );

    return fileInputNodes.map(nodeData => ({
      filePath: (nodeData.data?.filePath as string) || '',
      fileName: (nodeData.data?.fileName as string) || '',
      options: (nodeData.data?.options as FileOptionsNodeData) || {},
    }));
  }, [connectedNodesData]);

  const updateMixerData = useCallback(
    (data: FileInputNodeData[]) => {
      const mixerData: MixerNodeData = {
        files: data,
      };
      updateNodeDataReactFlow(nodeId, mixerData);
    },
    [nodeId, updateNodeDataReactFlow]
  );

  // Only update when actual connection data changes
  useEffect(() => {
    updateMixerData(processedData);
  }, [processedData, updateMixerData]);

  return processedData;
};
