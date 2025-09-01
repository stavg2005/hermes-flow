// src/__tests__/useOptions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNodeConnections, useNodesData, useReactFlow } from '@xyflow/react';
import { useOptions } from '@/features/nodes/fileinput/hooks/useOptions';
import { FileOptionsNodeData } from '@/features/nodes/types/NodeData';

// Mock the @xyflow/react hooks
vi.mock('@xyflow/react', () => ({
  useNodeConnections: vi.fn(),
  useNodesData: vi.fn(),
  useReactFlow: vi.fn(),
}));

const mockUseNodeConnections = vi.mocked(useNodeConnections);
const mockUseNodesData = vi.mocked(useNodesData);
const mockUseReactFlow = vi.mocked(useReactFlow);

describe('useOptions', () => {
  const mockUpdateNodeData = vi.fn();
  const testNodeId = 'test-node-id';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup
    mockUseReactFlow.mockReturnValue({
      updateNodeData: mockUpdateNodeData,
    } as any);
  });

  describe('when FileOptions node is connected', () => {
    const mockConnections = [
      { source: 'file-options-node-1' },
      { source: 'other-node' }
    ];

    const mockNodesData = [
      {
        id: 'file-options-node-1',
        type: 'fileOptions',
        data: { gain: 8 }
      },
      {
        id: 'other-node',
        type: 'someOtherType',
        data: {}
      }
    ];

    beforeEach(() => {
      mockUseNodeConnections.mockReturnValue(mockConnections as any);
      mockUseNodesData.mockReturnValue(mockNodesData as any);
    });

    it('should return processed data with gain', () => {
      const { result } = renderHook(() => useOptions(testNodeId));

      expect(result.current).toEqual({
        gain: 8
      });
    });

    it('should update node data with processed options', () => {
      renderHook(() => useOptions(testNodeId));

      expect(mockUpdateNodeData).toHaveBeenCalledWith(testNodeId, {
        options: { gain: 8 }
      });
    });
  });

  describe('when FileOptions node data has no gain', () => {
    beforeEach(() => {
      mockUseNodeConnections.mockReturnValue([{ source: 'file-options-node-1' }] as any);
      mockUseNodesData.mockReturnValue([{
        id: 'file-options-node-1',
        type: 'fileOptions',
        data: {} // No gain property
      }] as any);
    });

    it('should return  gain 1 as fallback', () => {
      const { result } = renderHook(() => useOptions(testNodeId));

      expect(result.current).toEqual({
        gain: 1
      });
    });
  });

  describe('when no FileOptions node is connected', () => {
    beforeEach(() => {
      mockUseNodeConnections.mockReturnValue([{ source: 'other-node' }] as any);
      mockUseNodesData.mockReturnValue([{
        id: 'other-node',
        type: 'someOtherType',
        data: {}
      }] as any);
    });

    it('should return null', () => {
      const { result } = renderHook(() => useOptions(testNodeId));

      expect(result.current).toBeNull();
    });

    it('should still call updateNodeData with null', () => {
      renderHook(() => useOptions(testNodeId));

      expect(mockUpdateNodeData).toHaveBeenCalledWith(testNodeId, {
        options: null
      });
    });
  });

  describe('when connections change', () => {
    it('should update when new FileOptions node is connected', () => {
      const { rerender } = renderHook(() => useOptions(testNodeId));

      // Initially no fileOptions node
      mockUseNodeConnections.mockReturnValue([{ source: 'other-node' }] as any);
      mockUseNodesData.mockReturnValue([{
        id: 'other-node',
        type: 'someOtherType',
        data: {}
      }] as any);

      rerender();

      // Now add fileOptions node
      mockUseNodeConnections.mockReturnValue([
        { source: 'other-node' },
        { source: 'file-options-node' }
      ] as any);
      mockUseNodesData.mockReturnValue([
        {
          id: 'other-node',
          type: 'someOtherType',
          data: {}
        },
        {
          id: 'file-options-node',
          type: 'fileOptions',
          data: { gain: 1 }
        }
      ] as any);

      rerender();

      expect(mockUpdateNodeData).toHaveBeenLastCalledWith(testNodeId, {
        options: { gain: 1 }
      });
    });
  });

  describe('memoization', () => {
    it('should only recalculate when connectedNodesData changes', () => {
      const mockConnections = [{ source: 'file-options-node' }];
      const mockNodesData = [{
        id: 'file-options-node',
        type: 'fileOptions',
        data: { gain: 0.5 }
      }];

      mockUseNodeConnections.mockReturnValue(mockConnections as any);
      mockUseNodesData.mockReturnValue(mockNodesData as any);

      const { result, rerender } = renderHook(() => useOptions(testNodeId));
      const firstResult = result.current;

      // Rerender with same data
      rerender();
      expect(result.current).toBe(firstResult); // Should be same reference

      // Change the data
      mockUseNodesData.mockReturnValue([{
        id: 'file-options-node',
        type: 'fileOptions',
        data: { gain: 0.8 } // Different gain
      }] as any);

      rerender();
      expect(result.current).not.toBe(firstResult); // Should be new reference
      expect(result.current).toEqual({ gain: 0.8 });
    });
  });
});
