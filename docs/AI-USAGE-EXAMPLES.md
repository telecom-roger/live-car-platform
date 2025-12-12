# 📚 Exemplos de Uso - IA Gratuita

Exemplos práticos de como usar os serviços de IA gratuitos no LiveCar Platform.

## 🎯 Casos de Uso Comuns

### 1. Análise Automática de Veículos

Quando um vendedor cadastra um veículo com fotos:

```typescript
// backend/src/controllers/vehicle.controller.ts
import { aiService } from '@/services/ai';

export const createVehicle = async (req: Request, res: Response) => {
  const { title, description, images } = req.body;
  
  // Analisar primeira imagem do veículo
  const imageAnalysis = await aiService.analyzeImage(
    images[0],
    `Analise este veículo e forneça:
    1. Marca e modelo (se identificável)
    2. Cor predominante
    3. Estado aparente de conservação
    4. Características visuais notáveis
    5. Sugestões de melhorias na foto
    
    Responda em português de forma profissional.`
  );
  
  // Salvar análise junto com o veículo
  const vehicle = await Vehicle.create({
    title,
    description,
    images,
    aiAnalysis: imageAnalysis
  });
  
  res.json(vehicle);
};
```

### 2. Melhoria Automática de Descrições

Ajudar vendedores a criar descrições mais atraentes:

```typescript
// backend/src/services/description-improver.service.ts
import { aiService } from '@/services/ai';

export const improveDescription = async (originalDescription: string): Promise<string> => {
  const improvedDescription = await aiService.analyzeText(
    originalDescription,
    `Você é um especialista em vendas de veículos. 
    Melhore a descrição abaixo tornando-a mais profissional, atraente e completa.
    Mantenha todos os fatos verdadeiros, apenas melhore a redação.
    Use português brasileiro.
    
    Descrição original:`
  );
  
  return improvedDescription;
};

// Uso
const original = "Carro usado bom estado revisado";
const improved = await improveDescription(original);
// Resultado: "Veículo seminovo em excelente estado de conservação, 
// com todas as revisões em dia conforme manual do fabricante..."
```

### 3. Moderação de Chat em Tempo Real

Detectar mensagens inadequadas no chat das lives:

```typescript
// backend/src/services/chat-moderator.service.ts
import { aiService } from '@/services/ai';

export const moderateMessage = async (message: string): Promise<{
  isAppropriate: boolean;
  reason?: string;
}> => {
  const analysis = await aiService.analyzeText(
    message,
    `Analise se esta mensagem é apropriada para um chat de vendas de veículos.
    Considere: linguagem ofensiva, spam, informações pessoais sensíveis, fraudes.
    Responda apenas: "APROPRIADA" ou "INAPROPRIADA: [motivo]"`
  );
  
  const isAppropriate = analysis.toUpperCase().includes('APROPRIADA') 
    && !analysis.toUpperCase().includes('INAPROPRIADA');
  
  return {
    isAppropriate,
    reason: isAppropriate ? undefined : analysis
  };
};
```

### 4. Extração de Informações de Áudio (Lives)

Transcrever e analisar perguntas dos compradores durante lives:

```typescript
// backend/src/services/live-qa.service.ts
import { aiService } from '@/services/ai';
import { WhisperLocalService } from '@/services/ai/whisper-local.service';

const whisper = new WhisperLocalService();

export const processVoiceQuestion = async (audioPath: string) => {
  // 1. Transcrever áudio para texto
  const transcription = await whisper.transcribe(audioPath);
  
  // 2. Identificar a pergunta principal
  const analysis = await aiService.analyzeText(
    transcription,
    `Extraia a pergunta principal deste texto e reformule-a de forma clara:
    
    Texto transcrito:`
  );
  
  // 3. Sugerir resposta ao vendedor
  const suggestedAnswer = await aiService.analyzeText(
    analysis,
    `Você é um vendedor de veículos experiente. 
    Sugira uma resposta profissional e útil para esta pergunta de um comprador:`
  );
  
  return {
    originalAudio: audioPath,
    transcription,
    question: analysis,
    suggestedAnswer
  };
};
```

### 5. Verificação de Qualidade de Imagens

Verificar se as fotos do veículo têm qualidade adequada:

```typescript
// backend/src/services/image-quality.service.ts
import { aiService } from '@/services/ai';

export const checkImageQuality = async (imageUrl: string): Promise<{
  score: number;
  issues: string[];
  suggestions: string[];
}> => {
  const analysis = await aiService.analyzeImage(
    imageUrl,
    `Avalie a qualidade desta foto de veículo considerando:
    1. Iluminação (boa/média/ruim)
    2. Nitidez (boa/média/ruim)
    3. Enquadramento (adequado/inadequado)
    4. Visibilidade do veículo (completo/parcial)
    
    Forneça uma pontuação de 0-10 e liste problemas e sugestões de melhoria.
    Formato: SCORE: X | ISSUES: ... | SUGGESTIONS: ...`
  );
  
  // Parse da resposta
  const scoreMatch = analysis.match(/SCORE:\s*(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
  
  const issuesMatch = analysis.match(/ISSUES:\s*([^|]+)/i);
  const issues = issuesMatch ? issuesMatch[1].split(',').map(s => s.trim()) : [];
  
  const suggestionsMatch = analysis.match(/SUGGESTIONS:\s*(.+)/i);
  const suggestions = suggestionsMatch 
    ? suggestionsMatch[1].split(',').map(s => s.trim()) 
    : [];
  
  return { score, issues, suggestions };
};
```

### 6. Geração de Tags Automáticas

Gerar tags relevantes para melhorar a busca:

```typescript
// backend/src/services/tag-generator.service.ts
import { aiService } from '@/services/ai';

export const generateTags = async (
  title: string, 
  description: string, 
  imageUrl?: string
): Promise<string[]> => {
  let prompt = `Com base no título e descrição abaixo, gere 10 tags relevantes 
  para busca de veículos. Inclua: marca, modelo, tipo, características.
  Retorne apenas as tags separadas por vírgula.
  
  Título: ${title}
  Descrição: ${description}`;
  
  let tags: string;
  
  if (imageUrl) {
    // Se tiver imagem, usar análise visual também
    tags = await aiService.analyzeImage(
      imageUrl,
      prompt + '\n\nConsidere também as características visuais da imagem.'
    );
  } else {
    tags = await aiService.analyzeText(`${title}\n${description}`, prompt);
  }
  
  // Parse e limpeza
  return tags
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 2)
    .slice(0, 10);
};

// Exemplo de uso
const tags = await generateTags(
  'Honda Civic 2020',
  'Veículo seminovo, completo, apenas 30 mil km rodados',
  'https://example.com/civic.jpg'
);
// Resultado: ['honda', 'civic', 'sedan', 'seminovo', 'baixa-quilometragem', ...]
```

### 7. Assistente Virtual para Compradores

Responder perguntas comuns automaticamente:

```typescript
// backend/src/services/buyer-assistant.service.ts
import { aiService } from '@/services/ai';

export const answerBuyerQuestion = async (
  question: string,
  vehicleData: any
): Promise<string> => {
  const context = `
  Veículo: ${vehicleData.title}
  Ano: ${vehicleData.year}
  Quilometragem: ${vehicleData.mileage} km
  Preço: R$ ${vehicleData.price}
  Descrição: ${vehicleData.description}
  `;
  
  const answer = await aiService.analyzeText(
    `${context}\n\nPergunta do comprador: ${question}`,
    `Você é um assistente de vendas profissional. 
    Responda a pergunta do comprador de forma clara, honesta e útil.
    Se a informação não estiver disponível, sugira que o comprador 
    entre em contato com o vendedor.`
  );
  
  return answer;
};

// Exemplo
const answer = await answerBuyerQuestion(
  "Este carro é econômico?",
  { title: "Honda Civic", year: 2020, ... }
);
```

## 🔄 Integração Completa

Exemplo de como integrar tudo em um fluxo completo:

```typescript
// backend/src/controllers/vehicle-upload.controller.ts
import { aiService } from '@/services/ai';
import { checkImageQuality } from '@/services/image-quality.service';
import { generateTags } from '@/services/tag-generator.service';
import { improveDescription } from '@/services/description-improver.service';

export const uploadVehicle = async (req: Request, res: Response) => {
  const { title, description, images, price, year, mileage } = req.body;
  
  try {
    // 1. Verificar qualidade das imagens
    const imageChecks = await Promise.all(
      images.map(img => checkImageQuality(img))
    );
    
    const lowQualityImages = imageChecks
      .filter(check => check.score < 6)
      .map((check, idx) => ({
        index: idx,
        issues: check.issues,
        suggestions: check.suggestions
      }));
    
    if (lowQualityImages.length > images.length / 2) {
      return res.status(400).json({
        error: 'Muitas imagens com baixa qualidade',
        details: lowQualityImages
      });
    }
    
    // 2. Melhorar descrição
    const improvedDescription = await improveDescription(description);
    
    // 3. Gerar tags automáticas
    const tags = await generateTags(title, improvedDescription, images[0]);
    
    // 4. Análise visual do veículo
    const vehicleAnalysis = await aiService.analyzeImage(
      images[0],
      'Descreva este veículo detalhadamente em português'
    );
    
    // 5. Salvar tudo no banco
    const vehicle = await Vehicle.create({
      title,
      description: improvedDescription,
      originalDescription: description,
      images,
      price,
      year,
      mileage,
      tags,
      aiAnalysis: vehicleAnalysis,
      imageQualityChecks: imageChecks,
      sellerId: req.user.id
    });
    
    res.json({
      success: true,
      vehicle,
      improvements: {
        descriptionImproved: description !== improvedDescription,
        tagsGenerated: tags.length,
        qualityChecked: true
      }
    });
    
  } catch (error) {
    console.error('Erro ao processar veículo:', error);
    res.status(500).json({ error: 'Erro ao processar veículo' });
  }
};
```

## 🚀 Performance e Otimização

### Cache de Resultados

```typescript
// backend/src/services/ai-cache.service.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hora

export const cachedAIService = {
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    const cacheKey = `image:${imageUrl}:${prompt}`;
    
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      console.log('Cache hit para análise de imagem');
      return cached;
    }
    
    const result = await aiService.analyzeImage(imageUrl, prompt);
    cache.set(cacheKey, result);
    
    return result;
  },
  
  async analyzeText(text: string, prompt?: string): Promise<string> {
    const cacheKey = `text:${text}:${prompt || ''}`;
    
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      console.log('Cache hit para análise de texto');
      return cached;
    }
    
    const result = await aiService.analyzeText(text, prompt);
    cache.set(cacheKey, result);
    
    return result;
  }
};
```

### Processamento em Background

```typescript
// backend/src/jobs/vehicle-analysis.job.ts
import Queue from 'bull';
import { aiService } from '@/services/ai';

const vehicleAnalysisQueue = new Queue('vehicle-analysis');

// Producer
export const queueVehicleAnalysis = async (vehicleId: string) => {
  await vehicleAnalysisQueue.add({ vehicleId });
};

// Consumer
vehicleAnalysisQueue.process(async (job) => {
  const { vehicleId } = job.data;
  const vehicle = await Vehicle.findById(vehicleId);
  
  if (!vehicle) return;
  
  // Análise assíncrona
  const analysis = await aiService.analyzeImage(
    vehicle.images[0],
    'Análise completa do veículo'
  );
  
  await Vehicle.update(vehicleId, { aiAnalysis: analysis });
});
```

## 📊 Monitoramento

```typescript
// backend/src/middleware/ai-metrics.middleware.ts
export const aiMetrics = {
  totalCalls: 0,
  imageAnalysis: 0,
  textAnalysis: 0,
  errors: 0,
  avgResponseTime: 0,
  
  recordCall(type: 'image' | 'text', responseTime: number, error: boolean = false) {
    this.totalCalls++;
    if (type === 'image') this.imageAnalysis++;
    if (type === 'text') this.textAnalysis++;
    if (error) this.errors++;
    
    this.avgResponseTime = 
      (this.avgResponseTime * (this.totalCalls - 1) + responseTime) / this.totalCalls;
  },
  
  getStats() {
    return {
      totalCalls: this.totalCalls,
      imageAnalysis: this.imageAnalysis,
      textAnalysis: this.textAnalysis,
      errors: this.errors,
      avgResponseTime: Math.round(this.avgResponseTime),
      errorRate: (this.errors / this.totalCalls * 100).toFixed(2) + '%'
    };
  }
};

// Endpoint para métricas
app.get('/api/admin/ai-metrics', (req, res) => {
  res.json(aiMetrics.getStats());
});
```

## 💡 Dicas de Uso

1. **Use cache** para análises repetidas (mesma imagem, mesmo prompt)
2. **Processe em background** tarefas não urgentes
3. **Combine múltiplas análises** em uma única chamada quando possível
4. **Monitore o uso** para identificar gargalos
5. **Ajuste os modelos** conforme necessidade (modelos menores = mais rápido)

---

Todos estes exemplos funcionam com **Ollama gratuitamente e sem limites!** 🎉
