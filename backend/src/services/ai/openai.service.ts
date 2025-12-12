/**
 * Serviço de IA usando OpenAI (PAGO)
 * 
 * Mantém compatibilidade com OpenAI para quem preferir usar
 * ou precisar de qualidade premium em casos específicos.
 */

import OpenAI from 'openai';
import { AIService } from './ai.interface';

export class OpenAIService implements AIService {
  private client: OpenAI;
  private visionModel: string;
  private textModel: string;

  constructor(
    apiKey: string = process.env.OPENAI_API_KEY || '',
    visionModel: string = 'gpt-4-vision-preview',
    textModel: string = 'gpt-4'
  ) {
    this.client = new OpenAI({ apiKey });
    this.visionModel = visionModel;
    this.textModel = textModel;
  }

  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('Erro ao analisar imagem com OpenAI:', error.message);
      throw new Error(`Falha na análise de imagem: ${error.message}`);
    }
  }

  async analyzeText(text: string, prompt?: string): Promise<string> {
    try {
      const fullPrompt = prompt 
        ? `${prompt}\n\nTexto: ${text}` 
        : text;

      const response = await this.client.chat.completions.create({
        model: this.textModel,
        messages: [
          { role: 'user', content: fullPrompt }
        ],
        max_tokens: 1000
      });

      return response.choices[0].message.content || '';
    } catch (error: any) {
      console.error('Erro ao analisar texto com OpenAI:', error.message);
      throw new Error(`Falha na análise de texto: ${error.message}`);
    }
  }

  async transcribeAudio(audioFilePath: string): Promise<string> {
    try {
      const fs = await import('fs');
      const audioFile = fs.createReadStream(audioFilePath);
      
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1'
      });

      return response.text;
    } catch (error: any) {
      console.error('Erro ao transcrever áudio com OpenAI:', error.message);
      throw new Error(`Falha na transcrição: ${error.message}`);
    }
  }
}
