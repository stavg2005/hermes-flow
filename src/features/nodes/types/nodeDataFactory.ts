import { NodeType } from '@/features/flow/types/connectionConfig';
import {
  ClientData,
  DelayNodeData,
  FileInputNodeData,
  FileOptionsNodeData,
  MixerNodeData,
} from '@/features/nodes/types/NodeData';

export const createDefaultNodeData = (
  type: NodeType
): Record<string, unknown> => {
  switch (type) {
    case 'mixer':
      return createDefaultMixerData();
    case 'delay':
      return createDefaultDelayData();
    case 'fileInput':
      return createDefaultInputData();
    case 'fileOptions':
      return createDefaultOptionsData();
    case 'clients':
      return createDefaultClientsData();
    default:
      return createUnknownData();
  }
};

const createDefaultMixerData = (): MixerNodeData => ({
  files: [],
});

const createDefaultDelayData = (): DelayNodeData => ({
  delay: 250,
});

const createDefaultInputData = (): FileInputNodeData => ({
  fileName: 'unknown',
  filePath: 'unknown',
  options: { gain: 1 },
});

const createDefaultOptionsData = (): FileOptionsNodeData => ({
  gain: 1,
});

const createDefaultClientsData = (): ClientData => ({
  id: '-1',
  name: 'unknown',
  ip: '-1',
  port: '-1',
});
const createUnknownData = (): Record<string, unknown> => ({
  unknown: 'unknown',
});
