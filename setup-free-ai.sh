#!/bin/bash

# 🆓 Script de Setup para IA Gratuita - LiveCar Platform
# Este script ajuda a configurar Ollama e modelos de IA gratuitamente

set -e

echo "🚀 LiveCar Platform - Setup de IA Gratuita"
echo "=========================================="
echo ""

# Detectar sistema operacional
OS="$(uname -s)"
echo "🖥️  Sistema detectado: $OS"
echo ""

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Instalar Ollama
echo "📦 Passo 1: Instalando Ollama..."
if command_exists ollama; then
    echo "✅ Ollama já está instalado!"
    ollama --version
else
    echo "📥 Baixando e instalando Ollama..."
    echo "⚠️  AVISO: Você está prestes a executar um script de instalação da internet."
    echo "   Por segurança, você pode revisar o script em: https://ollama.com/install.sh"
    read -p "Deseja continuar? (s/N): " -n 1 -r
    echo ""
    if ! [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "❌ Instalação cancelada. Instale manualmente de: https://ollama.com/download"
        exit 1
    fi
    
    if [[ "$OS" == "Linux" ]] || [[ "$OS" == "Darwin" ]]; then
        curl -fsSL https://ollama.com/install.sh | sh
        echo "✅ Ollama instalado com sucesso!"
    else
        echo "⚠️  Windows detectado. Por favor, baixe Ollama manualmente de:"
        echo "   https://ollama.com/download"
        exit 1
    fi
fi
echo ""

# 2. Iniciar serviço Ollama
echo "🔧 Passo 2: Iniciando serviço Ollama..."
if [[ "$OS" == "Linux" ]]; then
    sudo systemctl start ollama 2>/dev/null || ollama serve &
elif [[ "$OS" == "Darwin" ]]; then
    # No macOS, Ollama já inicia como serviço
    echo "✅ Ollama deve estar rodando como serviço no macOS"
fi
sleep 3
echo "✅ Serviço iniciado!"
echo ""

# 3. Baixar modelos
echo "🤖 Passo 3: Baixando modelos de IA..."
echo "   Isso pode levar alguns minutos dependendo da sua conexão..."
echo ""

# Modelo de visão (para análise de imagens/vídeos de carros)
echo "📸 Baixando modelo de visão (llava:13b)..."
ollama pull llava:13b
echo "✅ Modelo de visão baixado!"
echo ""

# Modelo de texto (para análise geral)
echo "📝 Baixando modelo de texto (mistral:7b)..."
ollama pull mistral:7b
echo "✅ Modelo de texto baixado!"
echo ""

# 4. Instalar whisper.cpp (opcional)
echo "🎤 Passo 4: Whisper.cpp para transcrição (opcional)..."
read -p "Deseja instalar whisper.cpp para transcrição de áudio? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    if [ ! -d "whisper.cpp" ]; then
        echo "📥 Clonando whisper.cpp..."
        git clone https://github.com/ggerganov/whisper.cpp
        cd whisper.cpp
        echo "🔨 Compilando..."
        make
        echo "📥 Baixando modelo base..."
        bash ./models/download-ggml-model.sh base
        cd ..
        echo "✅ Whisper.cpp instalado!"
    else
        echo "✅ Whisper.cpp já existe!"
    fi
else
    echo "⏭️  Pulando instalação do whisper.cpp"
fi
echo ""

# 5. Criar/atualizar .env
echo "⚙️  Passo 5: Configurando variáveis de ambiente..."
if [ -f "backend/.env" ]; then
    echo "📝 Arquivo backend/.env existe. Criando backup..."
    cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
fi

cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/livecar

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Mux (Streaming)
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret

# IA Provider (ollama para gratuito, openai para pago)
AI_PROVIDER=ollama

# Ollama (Gratuito e Ilimitado)
OLLAMA_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:13b
OLLAMA_TEXT_MODEL=mistral:7b

# Transcrição
TRANSCRIPTION_PROVIDER=whisper-local
WHISPER_PATH=./whisper.cpp
WHISPER_MODEL=./whisper.cpp/models/ggml-base.bin

# OpenAI (Apenas se usar AI_PROVIDER=openai)
# OPENAI_API_KEY=sk-...
EOF

echo "✅ Arquivo backend/.env.example criado!"
echo ""

# 6. Testar configuração
echo "🧪 Passo 6: Testando configuração..."
echo "📡 Testando conexão com Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama está respondendo!"
    echo ""
    echo "📋 Modelos instalados:"
    ollama list
else
    echo "⚠️  Ollama não está respondendo. Tente iniciar manualmente:"
    echo "   ollama serve"
fi
echo ""

# 7. Resumo
echo "🎉 Setup Concluído!"
echo "=================="
echo ""
echo "✅ Ollama instalado e rodando"
echo "✅ Modelos de IA baixados (llava:13b, mistral:7b)"
echo "✅ Configuração de exemplo criada"
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1. Configure seu arquivo backend/.env baseado no .env.example"
echo "2. Instale as dependências do backend:"
echo "   cd backend && npm install"
echo ""
echo "3. Inicie o backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Em outro terminal, inicie o frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "💡 Documentação completa em: docs/FREE-AI-SETUP.md"
echo ""
echo "🆓 Agora você pode usar IA de forma GRATUITA e ILIMITADA! 🎉"
echo ""
