<h1 align="center">
  <img src="src/assets/hero.png" alt="AlertaOrbital" width="80" /><br/>
  AlertaOrbital 🛰️
</h1>

<p align="center">
  <strong>Plataforma de Monitoramento de Desastres Naturais na América do Sul</strong><br/>
  Detecção em tempo real via satélites da NASA, USGS e GDACS
</p>

<p align="center">
  <a href="https://alerta-orbital-gs.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" />
  </a>
  <a href="https://github.com/MaThPMJ/AlertaOrbital-GS" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Repositório-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <img src="https://img.shields.io/badge/Status-Em%20Produção-22c55e?style=for-the-badge" alt="Status" />
</p>

---

## 📋 Índice

- [Descrição](#-descrição)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Usar](#-como-usar)
- [Autores](#-autores)
- [Contato](#-contato)

---

## 📖 Descrição

O **AlertaOrbital** é uma plataforma web desenvolvida para o monitoramento em tempo real de desastres naturais na **América do Sul**. O sistema integra dados de três fontes externas de satélite — **NASA EONET**, **USGS** e **GDACS** — para detectar e catalogar eventos como enchentes, incêndios, terremotos, deslizamentos e ciclones.

### Principais Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🌍 **Detecções ao Vivo** | Eventos naturais detectados em tempo real via NASA EONET, USGS Sismos e GDACS |
| 📋 **Gestão de Ocorrências** | Cadastro, acompanhamento e encerramento de ocorrências com ciclo de vida (Ativo → Controlado → Resolvido) |
| 🚨 **Sistema de Alertas** | Emissão de alertas com 4 níveis de severidade: Crítico, Alto, Médio e Baixo |
| 🛰️ **Vínculos com Satélites** | Cada ocorrência pode ser vinculada aos satélites que monitoram a região (CBERS-4A, Amazonia-1, Sentinel-2, Landsat-9, GOES-16) |
| 🗺️ **Regiões da América do Sul** | Cobertura de todos os países da América do Sul com registro por cidade e país |
| 📊 **Dashboard e Relatórios** | Visão geral estatística e relatórios de ocorrências por período e região |
| 👥 **Gestão de Usuários** | Controle de acesso com autenticação e cadastro de usuários |

### Satélites Monitorados

| Satélite | Agência | Especialidade |
|---|---|---|
| **CBERS-4A** | INPE / CNSA | Sensoriamento remoto — parceria Brasil/China |
| **Amazonia-1** | INPE | Monitoramento da floresta amazônica |
| **Sentinel-2A / 2B** | ESA | Imagens multiespectrais de alta resolução |
| **Landsat-9** | NASA / USGS | Mapeamento terrestre de longa duração |
| **GOES-16** | NOAA / NASA | Monitoramento meteorológico em tempo real |

---

## 🚀 Tecnologias Utilizadas

### Frontend

| Tecnologia | Versão | Finalidade |
|---|---|---|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) | 19.x | Biblioteca de interfaces |
| ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white) | 6.x | Tipagem estática |
| ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) | 8.x | Bundler e servidor de desenvolvimento |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white) | 4.x | Estilização utilitária |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white) | 7.x | Roteamento client-side (SPA) |
| ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154) | 5.x | Cache e gerenciamento de estado assíncrono |

### APIs e Serviços

| Serviço | Descrição |
|---|---|
| **Backend Java/Spring** | API REST própria hospedada no Render (`javags-ggho.onrender.com`) |
| **NASA EONET v3** | Catálogo de eventos naturais monitorados por satélites da NASA |
| **USGS Earthquake Catalog** | Dados sísmicos em tempo real da rede sismográfica dos EUA |
| **GDACS (ONU)** | Sistema Global de Alerta e Coordenação de Desastres |

### Infraestrutura

| Serviço | Finalidade |
|---|---|
| **Vercel** | Hospedagem e deploy automático do frontend |
| **Render** | Hospedagem do backend Java/Spring |
| **Oracle Database** | Banco de dados relacional do backend |

---

## 📁 Estrutura de Pastas

```
AlertaOrbital/
├── public/
│   └── integrantes/            # Fotos da equipe
├── src/
│   ├── api/
│   │   ├── client.ts           # Configuração do cliente HTTP (fetch + auth)
│   │   ├── mappers.ts          # Mapeamento DTO → tipos do frontend
│   │   └── types.ts            # Interfaces da API REST (DTOs e payloads)
│   ├── assets/                 # Imagens e recursos estáticos
│   ├── components/
│   │   ├── layout/             # AppShell, Header, Sidebar, PageHeader, AuthGuard
│   │   └── ui/                 # Componentes reutilizáveis: Button, Card, Badge,
│   │                           # Input, Select, Textarea, StatusBadge, StatCard...
│   ├── contexts/
│   │   └── AuthContext.tsx     # Contexto global de autenticação
│   ├── hooks/                  # React Query hooks por recurso da API
│   │   ├── useAlertas.ts
│   │   ├── useOcorrencias.ts
│   │   ├── useRegioes.ts
│   │   ├── useSatelites.ts
│   │   ├── useTiposDesastre.ts
│   │   └── useUsuarios.ts
│   ├── lib/
│   │   ├── queryClient.ts      # Configuração do TanStack Query
│   │   └── utils.ts            # Formatadores de data, ícones, helpers
│   ├── pages/                  # Páginas da aplicação
│   │   ├── DashboardPage.tsx       # Visão geral e KPIs
│   │   ├── OcorrenciasPage.tsx     # Listagem de ocorrências
│   │   ├── OcorrenciaFormPage.tsx  # Criação e edição de ocorrências
│   │   ├── OcorrenciaDetailPage.tsx# Detalhes, alertas e satélites vinculados
│   │   ├── AlertasPage.tsx         # Listagem de alertas
│   │   ├── DeteccoesPage.tsx       # Detecção ao vivo via satélites externos
│   │   ├── SatelitesPage.tsx       # Cadastro de satélites
│   │   ├── RelatoriosPage.tsx      # Relatórios por período e região
│   │   ├── UsuariosPage.tsx        # Gestão de usuários
│   │   ├── IntegrantesPage.tsx     # Equipe do projeto
│   │   ├── LoginPage.tsx           # Autenticação
│   │   ├── SobrePage.tsx           # Sobre o projeto
│   │   └── FAQPage.tsx             # Perguntas frequentes
│   ├── services/               # Camada de acesso a dados
│   │   ├── eonetService.ts         # Integração NASA EONET (América do Sul)
│   │   ├── usgsService.ts          # Integração USGS Sismos
│   │   ├── gdacsService.ts         # Integração GDACS (desastres ONU)
│   │   ├── ocorrenciaService.ts
│   │   ├── alertaService.ts
│   │   ├── regiaoService.ts
│   │   └── sateliteService.ts
│   └── types/
│       └── index.ts            # Tipos de domínio do sistema
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🖥️ Como Usar

### Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior

### Instalação e Execução Local

```bash
# 1. Clone o repositório
git clone https://github.com/MaThPMJ/AlertaOrbital-GS.git

# 2. Acesse a pasta do projeto
cd AlertaOrbital-GS

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

### Build para Produção

```bash
npm run build
npm run preview
```

### Links do Projeto

| Recurso | Link |
|---|---|
| 🌐 **Deploy (Vercel)** | [https://alerta-orbital-gs.vercel.app/](https://alerta-orbital-gs.vercel.app/) |
| 📦 **Repositório GitHub** | [https://github.com/MaThPMJ/AlertaOrbital-GS](https://github.com/MaThPMJ/AlertaOrbital-GS) |
| 🎥 **Vídeo no YouTube** | [https://youtu.be/a1dr-9BHcwg](https://youtu.be/a1dr-9BHcwg) |

---

## 👥 Autores

<table align="center">
  <tr>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/klaanyz">
        <img src="public/integrantes/davi.png" width="120" height="120" style="border-radius:50%;" alt="Davi Isac" />
      </a>
      <br/><br/>
      <b>Davi Isac Colin Pereira</b>
      <br/>
      <sub>RM567265 · Turma 1TDSPR</sub>
      <br/><br/>
      <a href="https://github.com/klaanyz">
        <img src="https://img.shields.io/badge/GitHub-klaanyz-181717?style=flat-square&logo=github" />
      </a>
      <br/>
      <a href="https://www.linkedin.com/in/davi-isac-a1a774372/">
        <img src="https://img.shields.io/badge/LinkedIn-Davi%20Isac-0A66C2?style=flat-square&logo=linkedin" />
      </a>
    </td>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/MaThPMJ">
        <img src="public/integrantes/Matheus.jpg" width="120" height="120" style="border-radius:50%;" alt="Matheus Peres" />
      </a>
      <br/><br/>
      <b>Matheus Peres</b>
      <br/>
      <sub>RM567300 · Turma 1TDSPR</sub>
      <br/><br/>
      <a href="https://github.com/MaThPMJ">
        <img src="https://img.shields.io/badge/GitHub-MaThPMJ-181717?style=flat-square&logo=github" />
      </a>
      <br/>
      <a href="https://www.linkedin.com/in/matheus10122002/">
        <img src="https://img.shields.io/badge/LinkedIn-Matheus%20Peres-0A66C2?style=flat-square&logo=linkedin" />
      </a>
    </td>
    <td align="center" style="padding: 20px;">
      <a href="https://github.com/PxdroGoncalves">
        <img src="public/integrantes/Pedro.jpg" width="120" height="120" style="border-radius:50%;" alt="Pedro Gonçalves" />
      </a>
      <br/><br/>
      <b>Pedro Gonçalves</b>
      <br/>
      <sub>RM567651 · Turma 1TDSPR</sub>
      <br/><br/>
      <a href="https://github.com/PxdroGoncalves">
        <img src="https://img.shields.io/badge/GitHub-PxdroGoncalves-181717?style=flat-square&logo=github" />
      </a>
      <br/>
      <a href="https://www.linkedin.com/in/pedro-gon%C3%A7alves-23561b389/">
        <img src="https://img.shields.io/badge/LinkedIn-Pedro%20Gonçalves-0A66C2?style=flat-square&logo=linkedin" />
      </a>
    </td>
  </tr>
</table>

---

## 📬 Contato

Dúvidas ou sugestões sobre o projeto? Fale com a equipe:

| Integrante | LinkedIn |
|---|---|
| Davi Isac Colin Pereira | [linkedin.com/in/davi-isac-a1a774372](https://www.linkedin.com/in/davi-isac-a1a774372/) |
| Matheus Peres | [linkedin.com/in/matheus10122002](https://www.linkedin.com/in/matheus10122002/) |
| Pedro Gonçalves | [linkedin.com/in/pedro-gonçalves-23561b389](https://www.linkedin.com/in/pedro-gon%C3%A7alves-23561b389/) |

Ou abra uma [issue no GitHub](https://github.com/MaThPMJ/AlertaOrbital-GS/issues) para reportar bugs e sugestões.

---

<p align="center">
  Desenvolvido com 💙 pela equipe <strong>AlertaOrbital</strong> — FIAP 2025
</p>
