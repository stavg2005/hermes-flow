import {
  FileInputNodeData,
  FileOptionsNodeData,
  MixerNodeData,
} from '@/features/nodes/types/NodeData';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { flowActions } from '@/store/slices/flowSlice';

export const useMixerData = (nodeId: string) => {
  const connections = useNodeConnections({ handleType: 'target' });
  const connectedNodesData = useNodesData(
    connections.map(connection => connection.source)
  );

  // React Flow hook for immediate updates
  const { updateNodeData: updateNodeDataReactFlow } = useReactFlow();

  // Redux dispatch for state sync
  const dispatch = useAppDispatch();

  // Get current node data from Redux (optional - for reading)
  const currentNodeData = useAppSelector(state =>
    state.flow.nodes.find(n => n.id === nodeId)?.data
  );

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

  // Stable update function that updates both React Flow and Redux
  const updateMixerData = useCallback(
    (data: FileInputNodeData[]) => {
      const mixerData: MixerNodeData = {
        files: data,
      };

      // 1. Update React Flow immediately for responsive UI
      updateNodeDataReactFlow(nodeId, mixerData);

      // 2. Sync to Redux for global state
      dispatch(flowActions.updateNode({
        id: nodeId,
        updates: mixerData
      }));
    },
    [nodeId, updateNodeDataReactFlow, dispatch]
  );

  // Only update when actual connection data changes
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
