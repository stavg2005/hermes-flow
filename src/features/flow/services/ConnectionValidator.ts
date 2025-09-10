import {
  ConnectionContext,
  ConnectionValidationResult,
  NODE_CONNECTION_CONFIG,
  NodeType,
} from '@/features/flow/types/connectionConfig';
export class ConnectionValidator {
  validate(context: ConnectionContext): ConnectionValidationResult {
    const validations = [
      this.validateBasicStructure,
      this.validateNodeTypes,
      this.validateHandles,
      this.validateConnectionLimits,
      this.validateDuplicates,
      //this.validateSemantics,
    ];

    for (const validation of validations) {
      const result = validation(context);
      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  private validateBasicStructure(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { connection } = context;

    if (!connection.source || !connection.target) {
      return {
        isValid: false,
        errorType: 'INVALID_NODES',
        message: 'Invalid connection: missing source or target',
      };
    }

    if (connection.source === connection.target) {
      return {
        isValid: false,
        errorType: 'SELF_CONNECTION',
        message: 'Cannot connect a node to itself',
      };
    }

    return { isValid: true };
  }

  private validateNodeTypes(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { sourceNode, targetNode } = context;

    const sourceConfig = NODE_CONNECTION_CONFIG[sourceNode.type as NodeType];
    const targetConfig = NODE_CONNECTION_CONFIG[targetNode.type as NodeType];

    if (!sourceConfig || !targetConfig) {
      return {
        isValid: false,
        errorType: 'INVALID_NODES',
        message: 'Unknown node type',
      };
    }

    if (
      !sourceConfig.outgoing.allowedTargets.has(targetNode.type as NodeType)
    ) {
      return {
        isValid: false,
        errorType: 'TYPE_MISMATCH',
        message: `${sourceNode.type} cannot connect to ${targetNode.type}`,
      };
    }

    if (
      !targetConfig.incoming.allowedSources.has(sourceNode.type as NodeType)
    ) {
      return {
        isValid: false,
        errorType: 'TYPE_MISMATCH',
        message: `${targetNode.type} cannot receive connections from ${sourceNode.type}`,
      };
    }

    return { isValid: true };
  }

  private validateHandles(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { connection, sourceNode, targetNode } = context;

    const sourceConfig = NODE_CONNECTION_CONFIG[sourceNode.type as NodeType];
    const targetConfig = NODE_CONNECTION_CONFIG[targetNode.type as NodeType];

    if (
      connection.sourceHandle &&
      !sourceConfig.outgoing.handles.has(connection.sourceHandle)
    ) {
      return {
        isValid: false,
        errorType: 'HANDLE_MISMATCH',
        message: `Invalid source handle: ${connection.sourceHandle}`,
      };
    }

    if (
      connection.targetHandle &&
      !targetConfig.incoming.handles.has(connection.targetHandle)
    ) {
      return {
        isValid: false,
        errorType: 'HANDLE_MISMATCH',
        message: `Invalid target handle: ${connection.targetHandle}`,
      };
    }

    return { isValid: true };
  }

  private validateConnectionLimits(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { connection, sourceNode, targetNode, existingEdges } = context;

    const sourceConfig = NODE_CONNECTION_CONFIG[sourceNode.type as NodeType];
    const targetConfig = NODE_CONNECTION_CONFIG[targetNode.type as NodeType];

    // Check outgoing connections from source
    const outgoingCount = existingEdges.filter(
      edge => edge.source === connection.source
    ).length;
    if (outgoingCount >= sourceConfig.outgoing.maxConnections) {
      return {
        isValid: false,
        errorType: 'MAX_OUTGOING_EXCEEDED',
        message: `${sourceNode.type} can only have ${sourceConfig.outgoing.maxConnections} outgoing connections`,
      };
    }

    // Check incoming connections to target
    const incomingCount = existingEdges.filter(
      edge => edge.target === connection.target
    ).length;
    if (incomingCount >= targetConfig.incoming.maxConnections) {
      return {
        isValid: false,
        errorType: 'MAX_INCOMING_EXCEEDED',
        message: `${targetNode.type} can only have ${targetConfig.incoming.maxConnections} incoming connections`,
      };
    }

    return { isValid: true };
  }

  private validateDuplicates(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { connection, existingEdges } = context;

    const isDuplicate = existingEdges.some(
      edge =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );

    if (isDuplicate) {
      return {
        isValid: false,
        errorType: 'DUPLICATE_CONNECTION',
        message: 'This connection already exists',
      };
    }

    return { isValid: true };
  }

  private validateSemantics(
    context: ConnectionContext
  ): ConnectionValidationResult {
    const { connection, sourceNode, targetNode, existingEdges } = context;
    console.log(connection);
    // Rule 1: Delay cannot connect to mixer if a fileInput is connected to the delay
    if (sourceNode.type === 'delay' && targetNode.type === 'mixer') {
      const hasFileInputConnected = existingEdges.some(
        edge =>
          edge.target === sourceNode.id &&
          context.allNodes.find(node => node.id === edge.source)?.type ===
            'fileInput'
      );

      if (hasFileInputConnected) {
        return {
          isValid: false,
          errorType: 'SEMANTIC_ERROR',
          message:
            'Delay cannot connect to mixer when a file input is connected to it',
        };
      }
    }

    // Rule 2: FileInput cannot connect to delay UNLESS the delay is connected to mixer
    if (sourceNode.type === 'fileInput' && targetNode.type === 'delay') {
      const delayConnectedToMixer = existingEdges.some(
        edge =>
          edge.source === targetNode.id &&
          context.allNodes.find(node => node.id === edge.target)?.type ===
            'mixer'
      );

      if (delayConnectedToMixer) {
        return {
          isValid: false,
          errorType: 'SEMANTIC_ERROR',
          message:
            'File input cant  connect to delay if the delay is connected to a mixer',
        };
      }
    }

    return { isValid: true };
  }
}
