# Sistema de Coleta e Análise de Dados Climáticos

Aplicação full-stack para coletar, processar, armazenar e exibir dados de clima, além de consumir APIs públicas paginadas e gerar insights sobre os dados coletados.

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura de microserviços orquestrados via Docker Compose:

- **Frontend**: React (Vite + TypeScript + Tailwind + shadcn/ui)
- **API**: NestJS (TypeScript)
- **Collector**: Python (coleta dados da Open-Meteo)
- **Worker**: Go (processa fila RabbitMQ)
- **Banco de Dados**: MongoDB
- **Message Broker**: RabbitMQ Cloud (CloudAMQP)

## 🚀 Como Rodar o Projeto

### Opção 1: Via Docker Compose (Recomendado)

A forma mais simples de executar todo o projeto é usando Docker Compose:

```bash
# Construir e iniciar todos os serviços
docker compose up --build

# Executar em background (detached mode)
docker compose up -d --build

# Parar todos os serviços
docker compose down

# Parar e remover volumes (limpar dados)
docker compose down -v
```

O Docker Compose irá iniciar automaticamente:
- MongoDB (porta 27017)
- API NestJS (porta 3000)
- Collector Python
- Worker Go
- Frontend React (porta 3001)

### Opção 2: Rodar Serviços Individualmente

#### Como Rodar o Serviço Python (Collector)

O serviço Python é responsável por coletar dados climáticos da API Open-Meteo e publicar no RabbitMQ.

**Pré-requisitos:**
- Python 3.8+
- pip

**Passos:**

1. Navegue até o diretório do collector:
```bash
cd backend/collector
```

2. Crie um ambiente virtual (recomendado):
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. **Configure o arquivo `.env` na raiz do projeto** com as seguintes variáveis de ambiente:
   - O Collector Python procura automaticamente o arquivo `.env` na raiz do projeto
   - Não é necessário criar um arquivo `.env` dentro de `backend/collector/`

   **Variáveis de Ambiente necessárias no `.env` da raiz:**
   ```env
   # URL de conexão com o RabbitMQ
   # Formato CloudAMQP: amqps://usuario:senha@host.cloudamqp.com/usuario
   # Formato local: amqp://admin:admin123@localhost:5672
   RABBITMQ_URL=amqps://usuario:senha@host.cloudamqp.com/usuario
   
   # Nome da fila no RabbitMQ (será criada automaticamente se não existir)
   QUEUE_NAME=weather.readings
   
   # Intervalo de coleta em segundos (3600 = 1 hora)
   COLLECTION_INTERVAL=3600
   ```

5. Execute o serviço:
```bash
python main.py
```

#### Como Rodar o Worker Go

O worker Go consome mensagens do RabbitMQ, valida os dados e envia para a API NestJS.

**Pré-requisitos:**
- Go 1.21+

**Passos:**

1. Navegue até o diretório do worker:
```bash
cd backend/worker
```

2. Instale as dependências:
```bash
go mod download
```

3. **Configure o arquivo `.env` na raiz do projeto** com as seguintes variáveis de ambiente:
   - O Worker Go procura automaticamente o arquivo `.env` na raiz do projeto
   - Não é necessário criar um arquivo `.env` dentro de `backend/worker/`

   **Variáveis de Ambiente necessárias no `.env` da raiz:**
   ```env
   # URL de conexão com o RabbitMQ
   # Formato CloudAMQP: amqps://usuario:senha@host.cloudamqp.com/usuario
   # Formato local: amqp://admin:admin123@localhost:5672
   RABBITMQ_URL=amqps://usuario:senha@host.cloudamqp.com/usuario
   
   # URL da API NestJS
   # Quando rodando localmente: http://localhost:3000
   # Quando rodando via Docker: http://api:3000
   API_URL=http://localhost:3000
   ```

4. Execute o worker:
```bash
go run main.go
```

## 🌐 URLs Principais

Após iniciar os serviços, as seguintes URLs estarão disponíveis:

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **Swagger/API Documentation**: http://localhost:3000/api
- **MongoDB**: localhost:27017
- **RabbitMQ**: CloudAMQP (externo - credenciais configuradas via variáveis de ambiente)

### Acessando o Swagger

O Swagger UI está disponível em `http://localhost:3000/api` e permite:
- Visualizar todos os endpoints da API
- Testar endpoints diretamente no navegador
- Ver exemplos de requisições e respostas
- Autenticar usando JWT Bearer Token

## 👤 Usuário Padrão

**Boa notícia**: O sistema cria automaticamente um usuário padrão quando a API é iniciada pela primeira vez. Você pode usar essas credenciais para fazer login imediatamente:

### Credenciais do Usuário Padrão

- **Email**: `user@example.com`
- **Senha**: `user123`
- **Nome**: Usuário Padrão
- **CEP**: 50030903 (Recife - PE)

### Como Fazer Login

#### 1. Via Frontend (Recomendado)

1. Acesse http://localhost:3001
2. Na página de login, use as credenciais acima
3. Clique em "Entrar" ou "Login"

#### 2. Via Swagger UI

1. Acesse http://localhost:3000/api
2. Navegue até o endpoint `POST /auth/login`
3. Clique em "Try it out"
4. Preencha os dados:
```json
{
  "email": "user@example.com",
  "password": "user123"
}
```
5. Clique em "Execute"
6. Copie o `access_token` retornado
7. Clique no botão "Authorize" no topo da página do Swagger
8. Cole o token no campo "Value" (formato: `Bearer seu-token-aqui`)

### Criando Novos Usuários

Se desejar criar usuários adicionais, você pode usar o endpoint de registro:

#### Via Swagger UI

1. Acesse http://localhost:3000/api
2. Navegue até o endpoint `POST /auth/register`
3. Clique em "Try it out"
4. Preencha os dados:
```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "password": "suaSenha123",
  "cep": "50030903"
}
```
5. Clique em "Execute"

#### Via Frontend

1. Acesse http://localhost:3001
2. Clique em "Registrar" ou "Sign Up"
3. Preencha o formulário de registro
4. Após o registro, faça login com as credenciais criadas

**Nota**: O usuário padrão é criado apenas uma vez. Se você já tiver iniciado a API anteriormente e o usuário já existir, ele não será recriado (evitando conflitos).

## 🔄 Fluxo de Dados

1. **Collector (Python)** → Coleta dados da Open-Meteo → Publica no RabbitMQ
2. **Worker (Go)** → Consome RabbitMQ → Valida → Envia para API NestJS
3. **API NestJS** → Recebe dados → Salva no MongoDB
4. **Frontend** → Consome API → Exibe dados e insights

## 📁 Estrutura do Projeto

```
root/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── api/          # NestJS: API principal
│   ├── worker/       # Go: consumer do RabbitMQ
│   └── collector/    # Python: coleta dados da Open-Meteo
└── frontend/         # React + Vite + TS + Tailwind + shadcn/ui
```

## 🛠️ Tecnologias

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript
- **Collector**: Python, pika, requests, schedule
- **Worker**: Go, RabbitMQ client
- **Banco de Dados**: MongoDB
- **Broker**: RabbitMQ (CloudAMQP)
- **Orquestração**: Docker Compose

## 🔧 Variáveis de Ambiente

### Arquivo .env Centralizado

**Importante**: O projeto usa um único arquivo `.env` na **raiz do projeto** para todas as variáveis de ambiente. Todos os serviços (API, Collector, Worker e Frontend) leem as variáveis deste arquivo centralizado.

#### Como Configurar

1. **Copie o arquivo `.env.example` para `.env` na raiz do projeto:**
```bash
# Na raiz do projeto
cp .env.example .env
```

2. **Edite o arquivo `.env` com suas credenciais:**
   - **RABBITMQ_URL**: URL do seu RabbitMQ (CloudAMQP ou local)
   - **MONGODB_URI**: URI de conexão com MongoDB (se rodando localmente)
   - **JWT_SECRET**: Chave secreta para tokens JWT (altere em produção!)
   - Outras variáveis conforme necessário

3. **Pronto!** Todos os serviços usarão automaticamente as variáveis do arquivo `.env` da raiz.

#### Variáveis Principais

```env
# API (NestJS)
MONGODB_URI=mongodb://admin:admin123@localhost:27017/gdash?authSource=admin
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# RabbitMQ (compartilhado entre Collector, Worker e API)
RABBITMQ_URL=amqps://usuario:senha@host.cloudamqp.com/usuario

# Collector (Python)
QUEUE_NAME=weather.readings
COLLECTION_INTERVAL=3600

# Worker (Go)
API_URL=http://localhost:3000

# Frontend (React/Vite)
VITE_API_URL=http://localhost:3000
```

**Nota**: 
- O arquivo `.env` não deve ser versionado (já está no `.gitignore`)
- Use o `.env.example` como referência
- O Docker Compose carrega automaticamente as variáveis do arquivo `.env` da raiz

## 🔧 Configuração do RabbitMQ

### Fila Automática

**Boa notícia**: Você **NÃO precisa criar a fila manualmente**! O código cria automaticamente a fila `weather.readings` quando os serviços são iniciados.

Tanto o **Worker Go** quanto o **Collector Python** declaram a fila automaticamente ao iniciar, então ela será criada se não existir.

### Usando sua própria instância do RabbitMQ

**Importante**: O `docker-compose.yml` está configurado com uma URL do CloudAMQP específica. Para usar o projeto, você tem duas opções:

#### Opção 1: Usar a mesma instância (não recomendado para produção)

Se você usar a mesma URL do CloudAMQP que está no `docker-compose.yml`, você estará compartilhando a mesma instância do RabbitMQ. Isso pode causar conflitos se múltiplas pessoas usarem simultaneamente.

#### Opção 2: Criar sua própria instância (recomendado)

1. **CloudAMQP** (recomendado para desenvolvimento):
   - Acesse https://www.cloudamqp.com/
   - Crie uma conta gratuita
   - Crie uma nova instância
   - Copie a URL de conexão (formato: `amqps://usuario:senha@host.cloudamqp.com/usuario`)
   - Atualize a variável `RABBITMQ_URL` no `docker-compose.yml` ou nos arquivos `.env`

2. **RabbitMQ Local** (via Docker):
   - Descomente a seção `rabbitmq` no `docker-compose.yml`
   - A fila será criada automaticamente quando os serviços iniciarem

A fila `weather.readings` será criada automaticamente em qualquer caso quando os serviços iniciarem.

## 📝 Notas Importantes

- O RabbitMQ está configurado para usar CloudAMQP (serviço externo). Se preferir usar RabbitMQ local, descomente a seção `rabbitmq` no `docker-compose.yml`.
- O MongoDB usa credenciais padrão: `admin/admin123` (altere em produção).
- O JWT_SECRET deve ser alterado em produção para um valor seguro.
- O frontend está configurado para se conectar à API em `http://localhost:3000`. Se a API estiver em outro endereço, ajuste a variável `VITE_API_URL` no `docker-compose.yml`.

## 🐛 Troubleshooting

### Problemas comuns

1. **Porta já em uso**: Certifique-se de que as portas 3000, 3001 e 27017 não estão em uso por outros serviços.

2. **Erro de conexão com MongoDB**: Verifique se o MongoDB está rodando e se as credenciais estão corretas.

3. **Erro de conexão com RabbitMQ**: Verifique se a URL do RabbitMQ está correta e se o serviço está acessível.

4. **Frontend não conecta à API**: Verifique se a variável `VITE_API_URL` está configurada corretamente e se a API está rodando.
