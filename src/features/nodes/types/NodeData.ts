export interface DelayNodeData extends Record<string, unknown> {
  delay: number;
}

export interface MixerNodeData extends Record<string, unknown> {
  files: FileInputNodeData[];
}

export interface FileInputNodeData extends Record<string, unknown> {
  filePath: string;
  fileName: string;
  options: FileOptionsNodeData;
}

export interface FileOptionsNodeData extends Record<string, unknown> {
  gain: number;
  //future options
}

export interface ClientData {
  id: string;
  name: string;
  ip: string;
  port: string;
  isSelected?: boolean;
  onUpdate?: (updatedData: Partial<ClientData>) => void;
  onRemove?: () => void;
}