// components/FlowBoard.tsx
import { nodeTypes } from "@/types/nodes"; 
import {
  getConnectionErrorMessage,
  isValidConnection,
} from "@/services/ConnectionValidation"
import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  ReactFlow,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { flowActions } from "../../store/slices/flowSlice";
import {
  selectEdges,
  selectNodes,
  useAppDispatch,
  useAppSelector,
  GetIsRunning
} from "../../store/store";

const FlowBoard: React.FC = () => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const edges = useAppSelector(selectEdges);
  const isProcessing = useAppSelector(GetIsRunning);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (!isProcessing) {
        dispatch(flowActions.applyNodeChanges(changes));
      }
    },
    [dispatch, isProcessing]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (!isProcessing) {
        dispatch(flowActions.applyEdgeChanges(changes));
      }
    },
    [dispatch, isProcessing]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (isProcessing) return;

      if (isValidConnection(connection, nodes, edges)) {
        dispatch(flowActions.addEdge(connection));
      } else {
        const errorMessage = getConnectionErrorMessage(connection, nodes, edges);
        toast.error(errorMessage);
      }
    },
    [dispatch, nodes, edges, isProcessing]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (isProcessing) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, [isProcessing]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (isProcessing) return;
      event.preventDefault();

      // Get node type from drag data transfer (not Redux)
      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeType || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create node data based on type
      const nodeData = createNodeData(nodeType);

      dispatch(
        flowActions.addNode({
          type: nodeType,
          position,
          data: nodeData,
        })
      );
    },
    [reactFlowInstance, dispatch, isProcessing]
  );

  return (
    <div
      className="fixed top-0 left-0 right-0 h-screen bg-slate-950"
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
        className="bg-slate-950"
        proOptions={{
          hideAttribution: true,
        }}
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={["Delete", "Backspace"]}
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          style: { strokeWidth: 8, stroke: "white" }, 
        }}
        minZoom={0.1} 
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={35}
          color="#ffffff"
          style={{ opacity: 0.5 }}
        />
      </ReactFlow>
    </div>
  );
};

// Helper function to create initial node data based on type
const createNodeData = (nodeType: string) => {
  const baseData = { label: `${nodeType} node` };
  
  switch (nodeType) {
    case 'fileInput':
      return { ...baseData, fileName: '', fileSize: 0 };
    case 'mixer':
      return { ...baseData, channels: 2, volume: 100 };
    case 'delay':
      return { ...baseData, delayTime: 1000, feedback: 50 };
    case 'clients':
      return { ...baseData, maxClients: 100 };
    case 'fileOptions':
      return { ...baseData, options: [] };
    default:
      return baseData;
  }
};

export default FlowBoard;