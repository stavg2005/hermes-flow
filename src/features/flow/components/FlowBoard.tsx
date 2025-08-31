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
import React, { useState } from 'react';

import { GetIsRunning, useAppSelector } from '@/app/store';
import { useFlowHandlers } from '../hooks/useFlowEvents.ts';

const initialNodes: CustomNode[] = [];
const initialEdges: CustomEdge[] = [];

const FlowBoard: React.FC = () => {
  const isProcessing = useAppSelector(GetIsRunning);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { onConnect, onDrop, onDragOver } = useFlowHandlers();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
