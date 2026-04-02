import {
  CustomEdge,
  CustomNode,
  nodeTypes,
} from '@/features/nodes/types/nodes';

import { GetIsRunning, useAppSelector } from '@/app/store';
import { useDebounceCallback } from '@/hooks/useDebounceCallback';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useEffect, useState } from 'react';
import { useFlowHandlers } from '../hooks/useFlowEvents.ts';

const initialNodes: CustomNode[] = [];
const initialEdges: CustomEdge[] = [];
const STORAGE_KEY = 'reactflow-workspace';

const FlowBoard: React.FC = () => {
  const isProcessing = useAppSelector(GetIsRunning);
  const { onConnect, onDrop, onDragOver } = useFlowHandlers();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const loadWorkflow = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
          setNodes(savedNodes || []);
          setEdges(savedEdges || []);
        } else {
          setNodes(initialNodes);
          setEdges(initialEdges);
        }
      } catch (error) {
        console.error('Error loading workflow:', error);
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [setNodes, setEdges]);

  // Create a stable, debounced save function
  const debouncedSave = useDebounceCallback(
    (currentNodes: CustomNode[], currentEdges: CustomEdge[]) => {
      try {
        const workflow = {
          nodes: currentNodes,
          edges: currentEdges,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
      } catch (error) {
        console.error('Error saving workflow:', error);
      }
    },
    500
  );

  // Trigger the debounced function whenever nodes or edges change
  useEffect(() => {
    if (!isLoading && (nodes.length > 0 || edges.length > 0)) {
      debouncedSave(nodes, edges);
    }
  }, [nodes, edges, isLoading, debouncedSave]);

  return (
    <div
      className='fixed top-0 left-0 right-0 h-screen bg-slate-950'
      onDrop={onDrop}
      onDragOver={onDragOver}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={!isProcessing}
        nodesConnectable={!isProcessing}
        elementsSelectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={() => {}}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        connectionMode={ConnectionMode.Loose}
        fitViewOptions={{
          padding: 0.2,
        }}
        className='bg-slate-950'
        proOptions={{
          hideAttribution: true,
        }}
        multiSelectionKeyCode={['Shift']}
        deleteKeyCode={['Delete', 'Backspace']}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          style: { strokeWidth: 8, stroke: 'white' },
        }}
        minZoom={0.1}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={35}
          color='#ffffff'
          style={{ opacity: 0.15 }}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowBoard;
