# 🚗 LiveCar Platform

> Plataforma de venda de carros com transmissões ao vivo, chat em tempo real e análise por IA.

![Status](https://img.shields.io/badge/status-MVP-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Funcionalidades

- ✅ Autenticação JWT (compradores e vendedores)
- ✅ CRUD completo de veículos
- ✅ Transmissão ao vivo via Mux
- ✅ Chat em tempo real (Socket.io)
- ✅ Análise de vídeo com IA (GPT-4 Vision + Whisper)
- ✅ Player HLS.js com baixa latência
- ✅ Dashboard para vendedores
- ✅ Busca e filtros avançados

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js, TypeScript, Express, PostgreSQL |
| **Frontend** | React, TypeScript, TailwindCSS, Vite |
| **Streaming** | Mux (RTMP/HLS) |
| **Real-time** | Socket.io |
| **IA** | OpenAI (GPT-4 Vision + Whisper) |
| **Auth** | JWT + bcrypt |

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/live-car-platform.git
cd live-car-platform

# 2. Backend
cd backend
npm install
cp .env.example .env
# Editar .env
npm run dev

# 3. Banco de dados (em outra aba)
createdb livecar
cd backend
for f in migrations/*.sql; do psql -d livecar -f "$f"; done

# 4. Frontend (em outra aba)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Acesse: http://localhost:5173

## 📚 Documentação

- [📦 Instalação Completa](docs/INSTALLATION.md)
- [🏗️ Arquitetura](docs/ARCHITECTURE.md)
- [📡 API Reference](docs/API.md)
- [🗺️ Roadmap](docs/ROADMAP.md)

## 🎬 Como Usar

### Vendedor

1. Criar conta como vendedor
2. Cadastrar veículo
3. Iniciar live
4. Transmitir via OBS Studio/app mobile
5. Interagir com compradores no chat

### Comprador

1. Criar conta como comprador
2. Navegar pelos veículos
3. Assistir lives ao vivo
4. Fazer perguntas no chat
5. Favoritar veículos

## 🔑 Variáveis de Ambiente

### Backend

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/livecar
JWT_SECRET=your-secret
MUX_TOKEN_ID=mux-token-id
MUX_TOKEN_SECRET=mux-secret
OPENAI_API_KEY=sk-...
```

### Frontend

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
```

## 📦 Estrutura do Projeto

```
live-car-platform/
├── backend/              # API REST + WebSocket
│   ├── src/
│   │   ├── config/      # Configurações (DB, JWT, Mux)
│   │   ├── controllers/ # Lógica de negócio
│   │   ├── middleware/  # Auth, validação, erros
│   │   ├── routes/      # Endpoints
│   │   ├── services/    # Integrações externas
│   │   └── websocket/   # Chat em tempo real
│   └── migrations/      # SQL migrations
│
├── frontend/            # Interface React
│   └── src/
│       ├── api/        # Axios config + endpoints
│       ├── components/ # Componentes React
│       ├── contexts/   # Context API
│       ├── hooks/      # Custom hooks
│       └── pages/      # Páginas
│
└── docs/               # Documentação
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚢 Deploy

### Backend
- Recomendado: Railway, Render ou Fly.io
- Database: Supabase ou Neon (PostgreSQL)

### Frontend
- Recomendado: Vercel ou Netlify

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'feat: adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Roadmap

- [x] MVP: Auth + CRUD + Lives + Chat
- [ ] Upload de imagens (Cloudflare R2)
- [ ] Sistema de favoritos
- [ ] Sistema de propostas
- [ ] Notificações push
- [ ] App mobile (React Native)
- [ ] Sistema de pagamento
- [ ] Analytics avançado

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- Website: https://livecar.com
- Email: contato@livecar.com
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

---

⭐ Se este projeto te ajudou, deixe uma estrela!

Feito com ❤️ por [Seu Nome]
