/**
 * Serviço de transcrição usando Whisper.cpp (GRATUITO)
 * 
 * Alternativa local ao Whisper da OpenAI.
 * Processa áudio localmente sem custos por chamada.
 * 
 * Requisitos:
 * - whisper.cpp compilado
 * - Modelo GGML baixado
 * 
 * @see https://github.com/ggerganov/whisper.cpp
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { basename } from 'path';

const execAsync = promisify(exec);

export class WhisperLocalService {
  private whisperPath: string;
  private modelPath: string;

  constructor(
    whisperPath: string = process.env.WHISPER_PATH || './whisper.cpp',
    modelPath: string = process.env.WHISPER_MODEL || './whisper.cpp/models/ggml-base.bin'
  ) {
    this.whisperPath = whisperPath;
    this.modelPath = modelPath;
  }

  /**
   * Transcreve um arquivo de áudio para texto
   * 
   * @param audioFilePath Caminho do arquivo de áudio (wav, mp3, etc.)
   * @returns Texto transcrito
   */
  async transcribe(audioFilePath: string): Promise<string> {
    try {
      // Verificar se arquivo existe
      await fs.access(audioFilePath);

      // Validar que o caminho não contém caracteres perigosos
      const safeBasename = basename(audioFilePath);
      if (safeBasename.includes('..') || safeBasename.includes(';') || safeBasename.includes('&')) {
        throw new Error('Nome de arquivo inválido');
      }

      // Executar whisper.cpp com parâmetros escapados
      const { stdout, stderr } = await execAsync(
        `"${this.whisperPath}/main" -m "${this.modelPath}" -f "${audioFilePath}" --output-txt`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          timeout: 300000 // 5 minutos timeout
        }
      );

      if (stderr) {
        console.warn('Whisper stderr:', stderr);
      }

      return stdout.trim();
    } catch (error: any) {
      console.error('Erro ao transcrever áudio:', error.message);
      throw new Error(`Falha na transcrição: ${error.message}`);
    }
  }

  /**
   * Transcreve com tradução para inglês
   */
  async transcribeAndTranslate(audioFilePath: string): Promise<string> {
    try {
      await fs.access(audioFilePath);

      // Validar que o caminho não contém caracteres perigosos
      const safeBasename = basename(audioFilePath);
      if (safeBasename.includes('..') || safeBasename.includes(';') || safeBasename.includes('&')) {
        throw new Error('Nome de arquivo inválido');
      }

      const { stdout } = await execAsync(
        `"${this.whisperPath}/main" -m "${this.modelPath}" -f "${audioFilePath}" --translate --output-txt`,
        {
          maxBuffer: 10 * 1024 * 1024,
          timeout: 300000
        }
      );

      return stdout.trim();
    } catch (error: any) {
      console.error('Erro ao transcrever e traduzir áudio:', error.message);
      throw new Error(`Falha na transcrição/tradução: ${error.message}`);
    }
  }

  /**
   * Verifica se whisper.cpp está instalado e acessível
   */
  async healthCheck(): Promise<boolean> {
    try {
      await execAsync(`"${this.whisperPath}/main" --help`, {
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Exemplo de uso:
 * 
 * const whisper = new WhisperLocalService();
 * 
 * // Transcrever pergunta de comprador no chat de voz
 * const text = await whisper.transcribe('/tmp/buyer-question.wav');
 * console.log('Comprador perguntou:', text);
 * 
 * // Com tradução
 * const translated = await whisper.transcribeAndTranslate('/tmp/audio.wav');
 */
