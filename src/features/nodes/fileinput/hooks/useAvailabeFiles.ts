// hooks/useAvailableFiles.ts
import { useStore, Edge } from '@xyflow/react';
import { useMemo } from 'react';
import type { FileMetadata } from '@/features/flow/components/WorkflowBAR/hooks/useMinIOOperations';

function getConnectedMixerIds(nodeId: string, edges: Edge[]): string[] {
  const outgoing = edges.filter(e => e.source === nodeId).map(e => e.target);
  // You may have multiple mixers downstream; we treat the union
  return Array.from(new Set(outgoing));
}

export function useAvailableFilesForMixers(
  nodeId: string,
  files: FileMetadata[]
) {
  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);

  return useMemo(() => {
    // 1) Which mixers does THIS fileInput feed?
    const mixerIds = getConnectedMixerIds(nodeId, edges);

    // If not connected to any mixer, all files are available.
    if (mixerIds.length === 0) return files;

    // 2) Gather all FileInputs that also feed any of those mixers (siblings)
    const siblings: string[] = [];
    for (const mixerId of mixerIds) {
      const incoming = edges.filter(e => e.target === mixerId);
      for (const e of incoming) {
        const n = nodes.find(n => n.id === e.source);
        if (!n) continue;
        if (n.type === 'fileInput' && n.id !== nodeId) {
          const name = n.data?.fileName as unknown;
          if (typeof name === 'string' && name && name !== 'unknown') {
            siblings.push(name);
          }
        }
      }
    }

    const used = new Set(siblings);
    return files.filter(f => !used.has(f.fileName));
  }, [nodeId, nodes, edges, files]);
}
