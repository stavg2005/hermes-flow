/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CustomEdge,
  CustomNode,
  nodeTypes,
} from '@/features/nodes/types/nodes';

import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import React, { useState,useEffect } from 'react';

import { GetIsRunning, useAppSelector } from '@/app/store';
import { useFlowHandlers } from '../hooks/useFlowEvents.ts';

const initialNodes: CustomNode[] = [];
const initialEdges: CustomEdge[] = [];
const STORAGE_KEY = 'reactflow-workspace';


const FlowBoard: React.FC = () => {
  const isProcessing = useAppSelector(GetIsRunning);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { onConnect, onDrop, onDragOver } = useFlowHandlers();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(true);


useEffect(() => {
    const loadWorkflow = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { nodes: savedNodes, edges: savedEdges, viewport } = JSON.parse(saved);
          setNodes(savedNodes || []);
          setEdges(savedEdges || []);
          console.log('Workflow loaded from storage');
        } else {
          // Use initial data if nothing saved
          setNodes(initialNodes);
          setEdges(initialEdges);
          console.log('Using initial workflow');
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

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (!isLoading && (nodes.length > 0 || edges.length > 0)) {
      const saveWorkflow = () => {
        try {
          const workflow = {
            nodes,
            edges,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(workflow));
          console.log('Workflow saved');
        } catch (error) {
          console.error('Error saving workflow:', error);
        }
      };

      // Debounce the save operation
      const timeoutId = setTimeout(saveWorkflow, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, isLoading]);


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
        onInit={setReactFlowInstance}
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
          style={{ opacity: 0.5 }}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowBoard;
