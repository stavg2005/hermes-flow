import {
  FileInputNodeData,
  FileOptionsNodeData,
} from '@/features/nodes/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo } from 'react';

export const useOptions = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });
  const connectedNodesData = useNodesData(
    connections.map(connection => connection.source)
  );

  const { updateNodeData } = useReactFlow();

  const processedData = useMemo(() => {
    const FileOptionsNodeData = connectedNodesData.find(
      nodeData => nodeData?.type === 'fileOptions'
    );
    if (!FileOptionsNodeData)
      return null;
    return {
      gain: (FileOptionsNodeData.data?.gain) || 1
    };
  }, [connectedNodesData]);

  const updateFileInputData = useCallback(
    (data: FileOptionsNodeData) => {
      const FileInputData: Partial<FileInputNodeData> = {
        options: data,
      };
      updateNodeData(nodeId, FileInputData);
    },
    [nodeId, updateNodeData]
  );
  useEffect(() => {
    updateFileInputData(processedData as FileOptionsNodeData);
  }, [processedData, updateFileInputData]);

  return processedData;
}
