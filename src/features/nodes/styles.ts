import { Position } from '@xyflow/react';
export const HANDLE_STYLES = {
  left: {
    id: 'file-output',
    type: 'source' as const,
    position: Position.Left,
    style: {
      right: '-12px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '24px',
      height: '24px',
      background: '#709DFF',
      borderRadius: '50%',
      border: 'none',
    },
  },
  right:{
    id: 'file-output',
  type: 'target' as const,
  position: Position.Right,
  style: {
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    background: '#709DFF',
    borderRadius: '50%',
    border: 'none',
  },
  }
} as const;
