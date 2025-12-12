/**
 * Serviço de IA usando Ollama (GRATUITO e ILIMITADO)
 * 
 * Ollama permite executar modelos de IA localmente sem custos.
 * Ideal para desenvolvimento e produção sem preocupações com custos por chamada.
 * 
 * Modelos recomendados:
 * - llava:13b para análise de imagens (carros, detalhes visuais)
 * - mistral:7b para análise de texto
 * 
 * @see https://ollama.com/
 */

import axios from 'axios';
import { AIService } from './ai.interface';

export class OllamaAIService implements AIService {
  private baseUrl: string;
  private visionModel: string;
  private textModel: string;

  constructor(
    baseUrl: string = process.env.OLLAMA_URL || 'http://localhost:11434',
    visionModel: string = process.env.OLLAMA_VISION_MODEL || 'llava:13b',
    textModel: string = process.env.OLLAMA_TEXT_MODEL || 'mistral:7b'
  ) {
    this.baseUrl = baseUrl;
    this.visionModel = visionModel;
    this.textModel = textModel;
  }

  /**
   * Analisa uma imagem de um veículo
   * Exemplo: Identificar marca, modelo, cor, estado de conservação
   */
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      // Validação básica de URL para prevenir SSRF
      const url = new URL(imageUrl);
      const allowedProtocols = ['http:', 'https:'];
      if (!allowedProtocols.includes(url.protocol)) {
        throw new Error('Protocolo de URL não permitido. Use http ou https.');
      }

      // Baixa a imagem e converte para base64 (Ollama requer base64)
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000 // 10 segundos timeout
      });
      const base64Image = Buffer.from(imageResponse.data).toString('base64');

      // Faz a requisição para Ollama com imagem
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.visionModel,
        prompt: prompt,
        images: [base64Image],
        stream: false
      });

      return response.data.response;
    } catch (error: any) {
      console.error('Erro ao analisar imagem com Ollama:', error.message);
      throw new Error(`Falha na análise de imagem: ${error.message}`);
    }
  }

  /**
   * Analisa texto usando IA
   * Exemplo: Extrair informações de descrições, detectar idioma, melhorar textos
   */
  async analyzeText(text: string, prompt?: string): Promise<string> {
    try {
      const fullPrompt = prompt 
        ? `${prompt}\n\nTexto: ${text}` 
        : text;

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.textModel,
        prompt: fullPrompt,
        stream: false
      });

      return response.data.response;
    } catch (error: any) {
      console.error('Erro ao analisar texto com Ollama:', error.message);
      throw new Error(`Falha na análise de texto: ${error.message}`);
    }
  }

  /**
   * Verifica se o serviço Ollama está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lista modelos disponíveis no Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map((m: any) => m.name);
    } catch (error: any) {
      console.error('Erro ao listar modelos:', error.message);
      return [];
    }
  }
}

/**
 * Exemplos de uso:
 * 
 * // Analisar imagem de um carro
 * const ollama = new OllamaAIService();
 * const analysis = await ollama.analyzeImage(
 *   'https://exemplo.com/carro.jpg',
 *   'Descreva este veículo em detalhes: marca, modelo, cor, estado de conservação e características visíveis.'
 * );
 * 
 * // Melhorar descrição de anúncio
 * const improvedText = await ollama.analyzeText(
 *   'carro usado bom estado',
 *   'Melhore esta descrição de veículo de forma profissional e atraente:'
 * );
 * 
 * // Verificar se está funcionando
 * const isOnline = await ollama.healthCheck();
 * console.log('Ollama online:', isOnline);
 */
