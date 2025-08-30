import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';
interface MixerHandleProps {
  type: 'source' | 'target';
  position: 'left' | 'right';
  isConnectable?: boolean;
}

const HANDLE_STYLES = {
  left: {
    left: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    right: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
} as const;

const COMMON_HANDLE_STYLE = {
  width: '24px',
  height: '24px',
  background: '#709DFF',
  borderRadius: '50%',
  border: 'none',
} as const;

export const MixerHandle = memo<MixerHandleProps>(
  ({ type, position, isConnectable }) => (
    <Handle
      type={type}
      id={`mixer-${type === 'target' ? 'input' : 'output'}`}
      position={position === 'left' ? Position.Left : Position.Right}
      isConnectable={isConnectable}
      style={{
        ...HANDLE_STYLES[position],
        ...COMMON_HANDLE_STYLE,
      }}
    />
  )
);

MixerHandle.displayName = 'MixerHandle';
