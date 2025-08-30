import { DelayNodeData, FileInputNodeData, MixerNodeData } from './NodeData';
import { CustomEdge, CustomNode } from './nodes.ts';
export interface NodeProcessor {
  readonly nodeType: string;
  process(
    nodeId: string,
    nodeData: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<void>;
}

export class DelayProcessor implements NodeProcessor {
  readonly nodeType = 'delay';

  async process(
    nodeId: string,
    nodeData: DelayNodeData,
    signal?: AbortSignal
  ): Promise<void> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    console.log("delay= " + nodeData.delay);
    await this.createDelay(nodeData.delay * 1000, signal);
  }

  private createDelay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}

export class MixerProcessor implements NodeProcessor {
  readonly nodeType = 'mixer';

  async process(
    nodeId: string,
    nodeData: MixerNodeData,
    signal?: AbortSignal
  ): Promise<void> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    await this.delay(1000, signal);
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}

export class FileProcessor implements NodeProcessor {
  readonly nodeType = 'FileInput';

  async process(
    nodeId: string,
    nodeData: FileInputNodeData,
    signal?: AbortSignal
  ): Promise<void> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    this.delay(1000, signal);
  }

  private delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }
}

export class ProcessorRegistry {
  private static processors = new Map<string | undefined, NodeProcessor>();

  static register(processor: NodeProcessor): void {
    this.processors.set(processor.nodeType, processor);
  }

  static get(nodeType: string | undefined): NodeProcessor | null {
    return this.processors.get(nodeType) || null;
  }

  static async executeProcess(
    nodeType: string | undefined,
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

// Register processors on startup
ProcessorRegistry.register(new MixerProcessor());
ProcessorRegistry.register(new FileProcessor());
ProcessorRegistry.register(new DelayProcessor());

export interface GraphTraversal {
  findStartNode(nodes: CustomNode[], edges: CustomEdge[]): CustomNode | null;
  getNextNode(currentNodeId: string, edges: CustomEdge[]): string | null;
  hasIncomingEdges(nodeId: string, edges: CustomEdge[]): boolean;
}
