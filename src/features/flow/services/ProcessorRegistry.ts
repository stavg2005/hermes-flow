import {
  DelayProcessor,
  FileProcessor,
  MixerProcessor,
  NodeProcessor,
} from '@/features/nodes/types/NodeProccesors';
export class ProcessorRegistry {
  private static readonly processors = new Map<string, NodeProcessor>();

  static register(processor: NodeProcessor): void {
    this.processors.set(processor.nodeType, processor);
  }

  static get(nodeType: string): NodeProcessor | null {
    return this.processors.get(nodeType) || null;
  }

  static async executeProcess(
    nodeType: string,
    nodeId: string,
    nodeData: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<void> {
    const processor = this.get(nodeType);
    if (!processor) {
      throw new Error(`No processor found for node type: ${nodeType}`);
    }
    await processor.process(nodeId, nodeData, signal);
  }
}

// Initialize processors
ProcessorRegistry.register(new DelayProcessor());
ProcessorRegistry.register(new MixerProcessor());
ProcessorRegistry.register(new FileProcessor());
