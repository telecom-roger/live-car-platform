/**
 * Interface base para serviços de IA
 * Permite trocar facilmente entre OpenAI, Ollama, LocalAI, etc.
 */

export interface AIService {
  /**
   * Analisa uma imagem com um prompt
   * @param imageUrl URL da imagem a ser analisada
   * @param prompt Pergunta ou instrução sobre a imagem
   * @returns Resposta textual da análise
   */
  analyzeImage(imageUrl: string, prompt: string): Promise<string>;

  /**
   * Analisa um texto com IA
   * @param text Texto a ser analisado
   * @param prompt Contexto ou instrução adicional (opcional)
   * @returns Resposta textual da análise
   */
  analyzeText(text: string, prompt?: string): Promise<string>;

  /**
   * Transcreve áudio para texto
   * @param audioFilePath Caminho do arquivo de áudio
   * @returns Texto transcrito
   */
  transcribeAudio?(audioFilePath: string): Promise<string>;
}

export interface AIServiceConfig {
  provider: 'openai' | 'ollama' | 'localai';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  visionModel?: string;
  textModel?: string;
}
