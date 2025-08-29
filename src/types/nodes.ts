import ClientsNode from '@/components/nodes/client/ClientsNode';
import DelayNodeComponent from '@/components/nodes/delay/DelayNode';
import FileInputNodeComponent from '@/components/nodes/fileinput/FileInput';
import FileOptions from '@/components/nodes/fileinput/FileOptions';
import MixerNodeComponent from '@/components/nodes/mixer/Mixer';

export const nodeTypes = {
  fileInput: FileInputNodeComponent,
  mixer: MixerNodeComponent,
  delay: DelayNodeComponent,
  clients: ClientsNode,
  fileOptions: FileOptions,
};
