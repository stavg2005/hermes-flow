import ClientsNode from '@/features/nodes/client/ClientsNode';
import DelayNodeComponent from '@/features/nodes/delay/DelayNode';
import FileInputNodeComponent from '@/features/nodes/fileinput/FileInput';
import FileOptions from '@/features/nodes/fileinput/FileOptions';
import MixerNodeComponent from '@/features/nodes/mixer/Mixer';

import type { Edge, Node } from '@xyflow/react';

export type CustomNode = Node;
export type CustomEdge = Edge;
export type NodeTYpe = "fileINput" | "mixer" | "delay" | "clients" | "fileOptions";
export const nodeTypes = {
  fileInput: FileInputNodeComponent,
  mixer: MixerNodeComponent,
  delay: DelayNodeComponent,
  clients: ClientsNode,
  fileOptions: FileOptions,
};
