# 🆓 Guia: Usando IA sem Custo e de Forma Ilimitada

Este guia explica como configurar a plataforma LiveCar para usar IA **completamente gratuita e ilimitada**, sem custos por agente ou chamadas de API.

## 🎯 Objetivo

Substituir serviços pagos de IA (OpenAI GPT-4 Vision + Whisper) por alternativas **open-source e gratuitas** que podem ser executadas localmente ou em servidores próprios.

## 📋 Alternativas Open-Source

### 1. **Ollama** (Recomendado) 🌟

Ollama permite executar modelos de IA localmente sem custos.

#### Instalação

```bash
# Linux/Mac
# NOTA DE SEGURANÇA: Antes de executar, você pode revisar o script em:
# https://ollama.com/install.sh
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Baixar de: https://ollama.com/download
```

#### Modelos Disponíveis

```bash
# Modelo de visão (substitui GPT-4 Vision)
ollama pull llava:13b

# Modelo de texto (análise geral)
ollama pull llama2:13b
ollama pull mistral:7b

# Modelos menores para hardware limitado
ollama pull llava:7b
ollama pull phi:2.7b
```

#### Configuração no Backend

```typescript
// backend/src/services/ai.service.ts
import axios from 'axios';

export class OllamaAIService {
  private baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/generate`, {
      model: 'llava:13b',
      prompt: `${prompt}\n\nImage: ${imageUrl}`,
      stream: false
    });
    return response.data.response;
  }

  async analyzeText(text: string): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/api/generate`, {
      model: 'mistral:7b',
      prompt: text,
      stream: false
    });
    return response.data.response;
  }
}
```

#### Variáveis de Ambiente

```env
# backend/.env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:13b
OLLAMA_TEXT_MODEL=mistral:7b
```

### 2. **Whisper.cpp** (Transcrição de Áudio)

Alternativa gratuita ao Whisper da OpenAI.

#### Instalação

```bash
# Clone o repositório
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp

# Compile
make

# Baixe o modelo (gratuito)
bash ./models/download-ggml-model.sh base
# Ou para melhor qualidade:
bash ./models/download-ggml-model.sh medium
```

#### Uso no Backend

```typescript
// backend/src/services/transcription.service.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class WhisperLocalService {
  private whisperPath = process.env.WHISPER_PATH || './whisper.cpp';
  private modelPath = process.env.WHISPER_MODEL || './models/ggml-base.bin';

  async transcribe(audioFilePath: string): Promise<string> {
    const command = `${this.whisperPath}/main -m ${this.modelPath} -f ${audioFilePath}`;
    const { stdout } = await execAsync(command);
    return stdout;
  }
}
```

#### Variáveis de Ambiente

```env
# backend/.env
TRANSCRIPTION_PROVIDER=whisper-local
WHISPER_PATH=/path/to/whisper.cpp
WHISPER_MODEL=/path/to/whisper.cpp/models/ggml-medium.bin
```

### 3. **LocalAI** (Solução All-in-One)

LocalAI é compatível com a API OpenAI, facilitando a migração.

#### Instalação com Docker

```bash
# Usando Docker
docker run -p 8080:8080 -v $PWD/models:/models localai/localai:latest

# Baixar modelos
curl http://localhost:8080/models/available
```

#### Configuração

```typescript
// backend/src/config/ai.config.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'not-needed',
  baseURL: process.env.LOCALAI_URL || 'http://localhost:8080/v1'
});

export const analyzeWithLocalAI = async (prompt: string) => {
  const completion = await client.chat.completions.create({
    model: 'gpt-3.5-turbo', // ou outro modelo instalado
    messages: [{ role: 'user', content: prompt }]
  });
  return completion.choices[0].message.content;
};
```

#### Variáveis de Ambiente

```env
# backend/.env
AI_PROVIDER=localai
LOCALAI_URL=http://localhost:8080/v1
```

### 4. **LM Studio** (Interface Gráfica)

Ideal para testes locais com interface amigável.

1. Baixar: https://lmstudio.ai/
2. Instalar modelos via interface
3. Iniciar servidor local
4. Usar API compatível com OpenAI

```env
# backend/.env
AI_PROVIDER=lmstudio
LMSTUDIO_URL=http://localhost:1234/v1
```

## 🔄 Arquitetura Flexível

Crie um serviço abstrato que suporta múltiplos provedores:

```typescript
// backend/src/services/ai/ai-factory.service.ts
import { OllamaAIService } from './ollama.service';
import { LocalAIService } from './localai.service';
import { OpenAIService } from './openai.service';

export class AIFactory {
  static createService() {
    const provider = process.env.AI_PROVIDER || 'ollama';
    
    switch (provider) {
      case 'ollama':
        return new OllamaAIService();
      case 'localai':
        return new LocalAIService();
      case 'openai':
        return new OpenAIService();
      default:
        return new OllamaAIService();
    }
  }
}

// Uso
const aiService = AIFactory.createService();
const result = await aiService.analyzeImage(imageUrl, 'Descreva este carro');
```

## 💻 Requisitos de Hardware

### Mínimo (Modelos Pequenos)
- CPU: 4 cores
- RAM: 8GB
- Disco: 10GB
- Modelos: llava:7b, phi:2.7b

### Recomendado (Melhor Performance)
- CPU: 8+ cores ou GPU NVIDIA
- RAM: 16GB+
- Disco: 50GB
- Modelos: llava:13b, mistral:7b

### Ideal (Máxima Qualidade)
- GPU: NVIDIA RTX 3090/4090 ou superior
- RAM: 32GB+
- Disco: 100GB SSD
- Modelos: llama2:70b, llava:34b

## 🚀 Deploy Gratuito

### Opção 1: Self-Hosted
- VPS barato (Hetzner, DigitalOcean a partir de $5/mês)
- Oracle Cloud Free Tier (sempre gratuito)
- Google Cloud Free Tier

### Opção 2: Hugging Face Spaces
```python
# Criar um Space no Hugging Face com Ollama
# Totalmente gratuito para uso público
```

### Opção 3: Render/Railway Free Tier
```yaml
# render.yaml
services:
  - type: web
    name: ollama-service
    env: docker
    plan: free
```

## 📊 Comparação de Custos

| Solução | Custo Mensal | Limite | Qualidade |
|---------|-------------|--------|-----------|
| **OpenAI GPT-4 Vision** | ~$200+ | Por token | Excelente |
| **Ollama (Local)** | $0 | Ilimitado | Muito Boa |
| **LocalAI (Local)** | $0 | Ilimitado | Muito Boa |
| **VPS Self-Hosted** | $5-20 | Ilimitado | Muito Boa |
| **Oracle Free Tier** | $0 | Ilimitado | Boa |

## ✅ Checklist de Implementação

- [ ] Instalar Ollama localmente
- [ ] Baixar modelos necessários (llava:13b, mistral:7b)
- [ ] Instalar whisper.cpp para transcrição
- [ ] Configurar variáveis de ambiente
- [ ] Implementar AIFactory no backend
- [ ] Criar serviços para cada provedor
- [ ] Testar com dados reais
- [ ] (Opcional) Deploy em VPS próprio

## 🔧 Configuração Completa

### 1. Backend (.env)

```env
# Provedor de IA (ollama, localai, openai)
AI_PROVIDER=ollama

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:13b
OLLAMA_TEXT_MODEL=mistral:7b

# Transcrição
TRANSCRIPTION_PROVIDER=whisper-local
WHISPER_PATH=/usr/local/bin/whisper.cpp
WHISPER_MODEL=/usr/local/share/whisper/ggml-medium.bin

# Não é mais necessário:
# OPENAI_API_KEY=sk-...
```

### 2. Instalar Dependências

```bash
cd backend
npm install axios  # Para Ollama API
```

### 3. Iniciar Serviços

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

## 📚 Recursos Adicionais

- **Ollama**: https://ollama.com/
- **Whisper.cpp**: https://github.com/ggerganov/whisper.cpp
- **LocalAI**: https://localai.io/
- **LM Studio**: https://lmstudio.ai/
- **Hugging Face**: https://huggingface.co/models

## ❓ FAQ

### Como a qualidade se compara?

Modelos como Llava 13B e Mistral 7B oferecem qualidade próxima ao GPT-3.5, suficiente para 90% dos casos de uso.

### Posso usar GPU para acelerar?

Sim! Ollama detecta automaticamente GPUs NVIDIA e usa CUDA para acelerar significativamente.

```bash
# Verificar se GPU está sendo usada
ollama list
nvidia-smi  # Para NVIDIA GPUs
```

### E se eu quiser qualidade premium?

Use modelos maiores (llama2:70b) ou combine: Ollama para a maioria das tarefas + OpenAI apenas para casos críticos (reduzindo custos em 90%).

### Isso funciona em produção?

Sim! Empresas como Hugging Face e Stability AI usam modelos self-hosted em produção. Para alta demanda, considere:
- Clusters GPU dedicados
- Caching de resultados
- Load balancing entre múltiplos modelos

## 🎉 Resultado

Com esta configuração, você terá:
- ✅ **Custo zero** por chamada de IA
- ✅ **Uso ilimitado**
- ✅ **Privacidade total** (dados não saem do servidor)
- ✅ **Baixa latência** (processamento local)
- ✅ **Flexibilidade** (troca de modelos facilmente)

---

**Dúvidas?** Abra uma issue no GitHub ou contribua com melhorias! 🚀
