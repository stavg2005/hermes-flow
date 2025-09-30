import { useEdges, useNodes, useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useFileOperations = () => {
  const nodes = useNodes();
  const edges = useEdges();
  const { setNodes, setEdges } = useReactFlow();
  const STORAGE_KEY = 'reactflow-workspace';
  const saveGraph = useCallback(() => {
    try {
      const graphData = {
        nodes,
        edges,
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length,
        },
      };

      const jsonString = JSON.stringify(graphData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `graph-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Graph saved successfully');
    } catch (error) {
      toast.error(`Error saving graph: ${error}`);
    }
  }, [nodes, edges]);

  const loadGraph = useCallback(
    async (file: any) => {
      if (!file) {
        toast.error('No file selected');
        return;
      }

      try {
        const graphData = file;

        if (!graphData.nodes || !graphData.edges) {
          throw new Error('Invalid file format: missing nodes or edges');
        }

        if (
          !Array.isArray(graphData.nodes) ||
          !Array.isArray(graphData.edges)
        ) {
          throw new Error(
            'Invalid file format: nodes and edges must be arrays'
          );
        }

        setNodes(graphData.nodes);
        setEdges(graphData.edges);

        toast.success('Graph loaded successfully');
      } catch (parseError) {
        console.log(file);
        toast.error(`Error parsing JSON file: ${parseError}`);
      }
    },
    [setNodes, setEdges]
  );

  const newGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);

    const workflow = {
      nodes: [],
      edges: [],
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
    toast.success('New graph created');
  }, [setNodes, setEdges]);

  return { saveGraph, loadGraph, newGraph };
};
