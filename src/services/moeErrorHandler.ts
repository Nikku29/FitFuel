/**
 * FitFuel - MoE Error Handling & Validation
 * Comprehensive error management for Mixture of Experts system
 */

export enum MoEErrorType {
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AGENT_FAILURE = 'AGENT_FAILURE',
  WORKFLOW_ERROR = 'WORKFLOW_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR'
}

export class MoEError extends Error {
  public readonly type: MoEErrorType;
  public readonly agent?: string;
  public readonly workflowId?: string;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    type: MoEErrorType,
    message: string,
    options: {
      agent?: string;
      workflowId?: string;
      retryable?: boolean;
      context?: Record<string, any>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'MoEError';
    this.type = type;
    this.agent = options.agent;
    this.workflowId = options.workflowId;
    this.retryable = options.retryable ?? this.isRetryableByDefault(type);
    this.context = options.context;
    this.cause = options.cause;
  }

  private isRetryableByDefault(type: MoEErrorType): boolean {
    switch (type) {
      case MoEErrorType.RATE_LIMIT:
      case MoEErrorType.TIMEOUT:
      case MoEErrorType.NETWORK_ERROR:
      case MoEErrorType.API_ERROR:
        return true;
      case MoEErrorType.VALIDATION_ERROR:
      case MoEErrorType.SCHEMA_ERROR:
      case MoEErrorType.AGENT_FAILURE:
      case MoEErrorType.WORKFLOW_ERROR:
        return false;
      default:
        return false;
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      agent: this.agent,
      workflowId: this.workflowId,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack
    };
  }
}

// Validation schemas for different data types
export const MoESchemas = {
  nutritionLog: {
    required: ['food_name', 'calories', 'meal_type'],
    types: {
      food_name: 'string',
      calories: 'number',
      macros: 'object',
      meal_type: 'string',
      date: 'string'
    }
  },

  workoutLog: {
    required: ['workout_title', 'duration', 'exercises'],
    types: {
      workout_title: 'string',
      duration: 'number',
      calories_burned: 'number',
      exercises: 'array',
      date: 'string'
    }
  },

  userProgress: {
    required: ['date', 'weight'],
    types: {
      date: 'string',
      weight: 'number',
      measurements: 'object',
      goals: 'object'
    }
  }
};

export class MoEValidator {
  static validateAgentResponse(response: any, agentType: string): void {
    if (!response || typeof response !== 'object') {
      throw new MoEError(
        MoEErrorType.VALIDATION_ERROR,
        'Invalid agent response format',
        { agent: agentType, context: { response } }
      );
    }

    if (!response.output) {
      throw new MoEError(
        MoEErrorType.AGENT_FAILURE,
        `Agent ${agentType} returned empty output`,
        { agent: agentType, context: { response } }
      );
    }

    if (response.error) {
      throw new MoEError(
        MoEErrorType.AGENT_FAILURE,
        `Agent ${agentType} error: ${response.error}`,
        { agent: agentType, retryable: false, context: { response } }
      );
    }
  }

  static validateStructuredOutput(output: string, schemaName: keyof typeof MoESchemas): void {
    let parsed: any;

    try {
      parsed = JSON.parse(output);
    } catch (error) {
      throw new MoEError(
        MoEErrorType.SCHEMA_ERROR,
        'Invalid JSON in structured output',
        {
          agent: 'structuring',
          context: { output, error: error.message },
          cause: error as Error
        }
      );
    }

    const schema = MoESchemas[schemaName];
    if (!schema) {
      throw new MoEError(
        MoEErrorType.VALIDATION_ERROR,
        `Unknown schema: ${schemaName}`,
        { context: { schemaName } }
      );
    }

    // Check required fields
    for (const field of schema.required) {
      if (!(field in parsed)) {
        throw new MoEError(
          MoEErrorType.SCHEMA_ERROR,
          `Missing required field: ${field}`,
          {
            agent: 'structuring',
            context: { parsed, missingField: field, schema: schemaName }
          }
        );
      }
    }

    // Check field types
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (field in parsed) {
        const actualType = Array.isArray(parsed[field]) ? 'array' : typeof parsed[field];
        if (actualType !== expectedType) {
          throw new MoEError(
            MoEErrorType.SCHEMA_ERROR,
            `Field ${field} has wrong type. Expected ${expectedType}, got ${actualType}`,
            {
              agent: 'structuring',
              context: { field, expectedType, actualType, value: parsed[field] }
            }
          );
        }
      }
    }
  }

  static validateWorkflowConfig(config: any): void {
    if (!config.workflowId || typeof config.workflowId !== 'string') {
      throw new MoEError(
        MoEErrorType.VALIDATION_ERROR,
        'Invalid workflow ID',
        { context: { config } }
      );
    }

    if (!config.prompt || typeof config.prompt !== 'string') {
      throw new MoEError(
        MoEErrorType.VALIDATION_ERROR,
        'Invalid workflow prompt',
        { context: { config } }
      );
    }

    if (config.maxIterations && (typeof config.maxIterations !== 'number' || config.maxIterations < 1)) {
      throw new MoEError(
        MoEErrorType.VALIDATION_ERROR,
        'Invalid maxIterations: must be a positive number',
        { context: { config } }
      );
    }
  }
}

// Error recovery strategies
export class MoERecovery {
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !(error instanceof MoEError) || !error.retryable) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  static getFallbackResponse(agentType: string, originalError: MoEError): any {
    switch (agentType) {
      case 'reasoning':
        return {
          next_agent: 'logic',
          context: 'Fallback due to reasoning agent failure'
        };

      case 'logic':
        return {
          calculation: 'Unable to calculate - using default values',
          fallback: true
        };

      case 'vision':
        return {
          analysis: 'Unable to analyze image - manual entry required',
          fallback: true
        };

      case 'structuring':
        return {
          error: 'Unable to structure data',
          fallback: true
        };

      default:
        return { error: 'Unknown agent type fallback', fallback: true };
    }
  }
}

// Error logging and monitoring
export class MoEMonitor {
  private static logs: MoEError[] = [];
  private static maxLogs = 100;

  static logError(error: MoEError): void {
    this.logs.push(error);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging for development
    console.error('[MoE Error]', {
      type: error.type,
      agent: error.agent,
      workflowId: error.workflowId,
      message: error.message,
      retryable: error.retryable,
      context: error.context
    });
  }

  static getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const error of this.logs) {
      stats[error.type] = (stats[error.type] || 0) + 1;
    }

    return stats;
  }

  static getRecentErrors(limit: number = 10): MoEError[] {
    return this.logs.slice(-limit);
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

// Global error handler wrapper
export function withMoEErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: { agent?: string; workflowId?: string }
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof MoEError) {
        MoEMonitor.logError(error);
        throw error;
      }

      // Wrap unknown errors
      const moeError = new MoEError(
        MoEErrorType.WORKFLOW_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        {
          ...context,
          cause: error instanceof Error ? error : undefined
        }
      );

      MoEMonitor.logError(moeError);
      throw moeError;
    }
  };
}