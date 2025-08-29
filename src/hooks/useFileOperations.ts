import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { flowActions } from '../store/slices/flowSlice';
import {
  selectEdges,
  selectNodes,
  useAppDispatch,
  useAppSelector,
} from '../store/store';

export const useFileOperations = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);

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

  const loadGraph = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';

    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) {
        toast.error('No file selected');
        return;
      }

      try {
        const fileContent = await file.text();
        const graphData = JSON.parse(fileContent);

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

        dispatch(flowActions.clearFlow());
        dispatch(
          flowActions.loadFlow({
            nodes: graphData.nodes,
            edges: graphData.edges,
          })
        );

        toast.success('Graph loaded successfully');
      } catch (parseError) {
        toast.error(`Error parsing JSON file: ${parseError}`);
      }

      document.body.removeChild(fileInput);
    };

    document.body.appendChild(fileInput);
    fileInput.click();
  }, [dispatch]);

  const newGraph = useCallback(() => {
    dispatch(flowActions.clearFlow());
  }, [dispatch]);

  return { saveGraph, loadGraph, newGraph };
};
