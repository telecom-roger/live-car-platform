/**
 * Factory para criar instâncias de serviços de IA
 * 
 * Permite trocar facilmente entre diferentes provedores através de
 * variáveis de ambiente, sem alterar código.
 * 
 * Uso:
 * const aiService = AIFactory.createService();
 * const result = await aiService.analyzeImage(url, prompt);
 */

import { AIService, AIServiceConfig } from './ai.interface';
import { OllamaAIService } from './ollama.service';
import { OpenAIService } from './openai.service';

export class AIFactory {
  /**
   * Cria uma instância do serviço de IA baseado na configuração
   */
  static createService(config?: Partial<AIServiceConfig>): AIService {
    const provider = config?.provider || process.env.AI_PROVIDER || 'ollama';

    switch (provider.toLowerCase()) {
      case 'ollama':
        return new OllamaAIService(
          config?.baseUrl,
          config?.visionModel,
          config?.textModel
        );

      case 'openai':
        return new OpenAIService(
          config?.apiKey,
          config?.visionModel,
          config?.textModel
        );

      case 'localai':
        // LocalAI usa a mesma interface do OpenAI
        return new OpenAIService(
          'not-needed', // LocalAI não precisa de API key
          config?.visionModel,
          config?.textModel
        );

      default:
        console.warn(
          `Provedor '${provider}' não reconhecido. Usando Ollama como padrão (gratuito).`
        );
        return new OllamaAIService();
    }
  }

  /**
   * Cria instância para usar Ollama (gratuito)
   */
  static createOllama(): OllamaAIService {
    return new OllamaAIService();
  }

  /**
   * Cria instância para usar OpenAI (pago)
   */
  static createOpenAI(apiKey?: string): OpenAIService {
    return new OpenAIService(apiKey);
  }
}

/**
 * Exporta instância singleton do serviço de IA
 * Pode ser importado diretamente em controllers
 */
export const aiService = AIFactory.createService();

/**
 * Exemplos de uso:
 * 
 * // 1. Usar o serviço padrão (configurado via .env)
 * import { aiService } from './services/ai/ai.factory';
 * const result = await aiService.analyzeImage(url, prompt);
 * 
 * // 2. Criar instância específica
 * import { AIFactory } from './services/ai/ai.factory';
 * const ollama = AIFactory.createOllama();
 * const result = await ollama.analyzeImage(url, prompt);
 * 
 * // 3. Configuração customizada
 * const customAI = AIFactory.createService({
 *   provider: 'ollama',
 *   baseUrl: 'http://custom-server:11434',
 *   visionModel: 'llava:34b'
 * });
 */
