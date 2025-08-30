import { DelayNodeData, MixerNodeData, FileInputNodeData, FileOptionsNodeData } from "@/features/nodes/types/NodeData";
import { NodeType } from "@/features/flow/types/connectionConfig";

// Option 1: As a utility function (recommended if no React state needed)
export const createDefaultNodeData = (type: NodeType): Record<string, unknown> => {
  switch (type) {
    case "mixer":
      return createDefaultMixerData();
    case "delay":
      return createDefaultDelayData();
    case "fileInput":
      return createDefaultInputData();
    case "fileOptions":
      return createDefaultOptionsData();
    default:
      return createUnknownData();
  }
};

const createDefaultMixerData = (): MixerNodeData => ({
  files: []
});

const createDefaultDelayData = (): DelayNodeData => ({
  delay: 250
});

const createDefaultInputData = (): FileInputNodeData => ({
  fileName: "unknown",
  filePath: "unknown",
  options: { gain: 1 }
});

const createDefaultOptionsData = (): FileOptionsNodeData => ({
  gain: 1
});

const createUnknownData = (): Record<string, unknown> => ({
  unknown: "unknown"
});


