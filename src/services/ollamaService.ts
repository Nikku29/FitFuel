import axios, { AxiosInstance } from 'axios';

interface OllamaConfig {
  baseUrl: string;
  timeout?: number;
  model?: string;
}

interface GenerateOptions {
  model?: string;
  stream?: boolean;
  temperature?: number;
  top_k?: number;
  top_p?: number;
  num_predict?: number;
}

interface EmbeddingOptions {
  model?: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  message: string;
}

interface GenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface EmbeddingResponse {
  embedding: number[];
}

/**
 * OllamaService - Service class for interacting with Ollama API
 * Provides methods for health checks, text generation, and embedding generation
 */
export class OllamaService {
  private client: AxiosInstance;
  private defaultModel: string;
  private baseUrl: string;

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl;
    this.defaultModel = config.model || 'llama2';

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check the health status of the Ollama service
   * @returns Promise with health status and message
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await this.client.get('/api/tags', {
        timeout: 5000,
      });

      if (response.status === 200 && response.data) {
        return {
          status: 'healthy',
          message: 'Ollama service is running',
        };
      }

      return {
        status: 'unhealthy',
        message: 'Ollama service returned unexpected response',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Failed to connect to Ollama service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generate text using Ollama with streaming support
   * @param prompt - The input prompt for generation
   * @param options - Generation options (model, temperature, etc.)
   * @param onStream - Optional callback function for streaming responses
   * @returns Promise with the complete generated response
   */
  async generate(
    prompt: string,
    options?: GenerateOptions,
    onStream?: (chunk: string) => void
  ): Promise<GenerateResponse> {
    try {
      const model = options?.model || this.defaultModel;
      const useStream = options?.stream !== false;

      const response = await this.client.post(
        '/api/generate',
        {
          model,
          prompt,
          stream: useStream,
          temperature: options?.temperature ?? 0.7,
          top_k: options?.top_k,
          top_p: options?.top_p,
          num_predict: options?.num_predict,
        },
        {
          responseType: useStream ? 'stream' : 'json',
        }
      );

      if (useStream) {
        return await this.handleStreamingResponse(response, onStream);
      } else {
        return response.data as GenerateResponse;
      }
    } catch (error) {
      throw new Error(
        `Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate embeddings for a given text
   * @param text - The text to generate embeddings for
   * @param options - Embedding options (model, etc.)
   * @returns Promise with the embedding vector
   */
  async generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<number[]> {
    try {
      const model = options?.model || this.defaultModel;

      const response = await this.client.post(
        '/api/embeddings',
        {
          model,
          prompt: text,
        }
      );

      const data = response.data as EmbeddingResponse;
      return data.embedding;
    } catch (error) {
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to generate embeddings for
   * @param options - Embedding options
   * @returns Promise with array of embedding vectors
   */
  async generateBatchEmbeddings(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<number[][]> {
    try {
      const embeddings = await Promise.all(
        texts.map((text) => this.generateEmbedding(text, options))
      );
      return embeddings;
    } catch (error) {
      throw new Error(
        `Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle streaming response from Ollama
   * @param response - Axios response stream
   * @param onStream - Optional callback for stream chunks
   * @returns Promise with complete response
   */
  private async handleStreamingResponse(
    response: any,
    onStream?: (chunk: string) => void
  ): Promise<GenerateResponse> {
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      let lastData: GenerateResponse | null = null;

      response.data.on('data', (chunk: Buffer) => {
        try {
          const lines = chunk.toString().split('\n').filter((line) => line.trim());

          for (const line of lines) {
            const data = JSON.parse(line) as GenerateResponse;
            lastData = data;

            if (data.response) {
              fullResponse += data.response;
              if (onStream) {
                onStream(data.response);
              }
            }
          }
        } catch (error) {
          reject(new Error(`Error parsing stream data: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      });

      response.data.on('end', () => {
        if (lastData) {
          lastData.response = fullResponse;
          resolve(lastData);
        } else {
          reject(new Error('No response received from stream'));
        }
      });

      response.data.on('error', (error: Error) => {
        reject(new Error(`Stream error: ${error.message}`));
      });
    });
  }

  /**
   * Set the default model for this service
   * @param model - Model name to set as default
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Get the current default model
   * @returns The default model name
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Update the base URL for the Ollama service
   * @param baseUrl - New base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }
}

export default OllamaService;
