/**
 * Serviços de IA para LiveCar Platform
 * 
 * Este módulo fornece diferentes implementações de serviços de IA,
 * permitindo escolher entre opções pagas (OpenAI) e gratuitas (Ollama).
 * 
 * Configuração via variável de ambiente AI_PROVIDER:
 * - 'ollama' (padrão): Gratuito, ilimitado, local
 * - 'openai': Pago, alta qualidade
 * - 'localai': Gratuito, compatível com OpenAI
 */

export { AIService, AIServiceConfig } from './ai.interface';
export { OllamaAIService } from './ollama.service';
export { OpenAIService } from './openai.service';
export { WhisperLocalService } from './whisper-local.service';
export { AIFactory, aiService } from './ai.factory';

/**
 * Quick Start:
 * 
 * // Use o serviço padrão (configurado via .env)
 * import { aiService } from '@/services/ai';
 * 
 * // Analisar imagem de veículo
 * const analysis = await aiService.analyzeImage(
 *   imageUrl,
 *   'Descreva este veículo em detalhes'
 * );
 * 
 * // Analisar texto
 * const result = await aiService.analyzeText(
 *   userMessage,
 *   'Responda de forma profissional'
 * );
 */
