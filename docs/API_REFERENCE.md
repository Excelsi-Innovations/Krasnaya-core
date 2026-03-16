# Krasnaya-Core API Reference

**Versão:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**Formato:** JSON  
**Autenticação:** JWT Bearer Token

---

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Gestão de Scripts](#gestão-de-scripts)
3. [Execução e Monitoramento](#execução-e-monitoramento)
4. [Webhooks](#webhooks)
5. [Validação de AST](#validação-de-ast)
6. [Modelos de Dados](#modelos-de-dados)

---

## Autenticação

### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "username": "admin"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Resposta (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Uso do Token:**
```http
Authorization: Bearer <token>
```

---

## Gestão de Scripts

### Listar Todos os Scripts
```http
GET /management/scripts
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Welcome Command",
    "description": "Greets new users",
    "version": "1.0.0",
    "isActive": true,
    "createdAt": "2026-03-16T15:00:00.000Z",
    "updatedAt": "2026-03-16T15:00:00.000Z"
  }
]
```

### Criar Script
```http
POST /management/scripts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",           // Obrigatório
  "description": "string",    // Opcional
  "version": "string",        // Obrigatório
  "ast": "object",            // Obrigatório (AST JSON)
  "isActive": true,           // Opcional (default: true)
  "metadata": {}              // Opcional
}
```

**Exemplo de AST:**
```json
{
  "type": "sequence",
  "nodes": [
    {
      "type": "say",
      "text": "Olá! Bem-vindo ao Krasnaya-Core."
    },
    {
      "type": "prompt",
      "text": "Qual é o seu nome?",
      "variable": "userName"
    },
    {
      "type": "say",
      "text": "Prazer em conhecê-lo, {{userName}}!"
    }
  ]
}
```

**Resposta (201 Created):**
```json
{
  "id": 1,
  "name": "Welcome Command",
  "description": "Greets new users",
  "version": "1.0.0",
  "isActive": true,
  "createdAt": "2026-03-16T15:00:00.000Z",
  "updatedAt": "2026-03-16T15:00:00.000Z"
}
```

### Obter Script por ID
```http
GET /management/scripts/:id
Authorization: Bearer <token>
```

**Resposta (200 OK):** Mesmo modelo de criar script.

**Resposta (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Script with ID 999 not found",
  "error": "Not Found"
}
```

### Atualizar Script
```http
PUT /management/scripts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",           // Opcional
  "description": "string",    // Opcional
  "version": "string",        // Opcional
  "ast": "object",            // Opcional
  "isActive": true,           // Opcional
  "metadata": {}              // Opcional
}
```

**Resposta (200 OK):** Script atualizado.

### Deletar Script
```http
DELETE /management/scripts/:id
Authorization: Bearer <token>
```

**Resposta (204 No Content)**

---

## Execução e Monitoramento

### Executar Comando Manualmente
```http
POST /management/execution/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "scriptId": "1",            // Obrigatório (ID do script)
  "platform": "string",       // Obrigatório (discord, telegram, etc.)
  "chatId": "string",         // Obrigatório
  "userId": "string",         // Opcional
  "context": {}               // Opcional (variáveis iniciais)
}
```

**Resposta (202 Accepted):**
```json
{
  "id": 1,
  "scriptId": 1,
  "platform": "discord",
  "chatId": "123456789",
  "userId": "user123",
  "status": "success",
  "output": "Execution completed",
  "executionTime": 150,
  "createdAt": "2026-03-16T15:00:00.000Z"
}
```

### Listar Logs de Execução
```http
GET /management/execution/logs
Authorization: Bearer <token>

// Query Parameters:
// ?scriptId=1  (filtro por script)
// ?limit=50    (paginação)
// ?offset=0    (paginação)
```

**Resposta (200 OK):**
```json
[
  {
    "id": 1,
    "scriptId": 1,
    "platform": "discord",
    "chatId": "123456789",
    "userId": "user123",
    "status": "success",
    "output": "Execution completed",
    "executionTime": 150,
    "createdAt": "2026-03-16T15:00:00.000Z"
  }
]
```

### Obter Log Específico
```http
GET /management/execution/logs/:id
Authorization: Bearer <token>
```

**Resposta (200 OK):** Log completo da execução.

### Estatísticas do Dashboard
```http
GET /management/execution/stats
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "totalScripts": 5,
  "activeScripts": 4,
  "totalExecutions": 150,
  "failedExecutions": 3,
  "successRate": "98.00"
}
```

---

## Webhooks

### Receber Eventos de Plataforma
```http
POST /webhook/:platform
```

**Parâmetros:**
- `platform`: Nome da plataforma (telegram, discord, etc.)

**Exemplo - Discord:**
```http
POST /webhook/discord
Content-Type: application/json

{
  "type": 2,
  "channel_id": "123456789",
  "data": {
    "custom_id": "button_click"
  },
  "member": {
    "user": {
      "id": "user123"
    }
  }
}
```

**Resposta (200 OK):**
```json
{
  "status": "ok"
}
```

---

## Validação de AST

### Validar Script
```http
POST /ast/validate
Content-Type: application/json

{
  "type": "sequence",
  "nodes": [
    {
      "type": "say",
      "text": "Hello"
    }
  ]
}
```

**Resposta (200 OK):** Script validado com sucesso.

**Resposta (400 Bad Request):** Erro de validação do Zod.

### Debug de Execução
```http
POST /ast/debug/execute
Content-Type: application/json

{
  "ast": { /* AST JSON */ },
  "context": {}
}
```

**Resposta (200 OK):** Simulação de execução.

---

## Modelos de Dados

### Script
```json
{
  "id": 1,
  "name": "Welcome Command",
  "description": "Greets new users",
  "version": "1.0.0",
  "ast": { /* AST JSON */ },
  "isActive": true,
  "metadata": {},
  "createdAt": "2026-03-16T15:00:00.000Z",
  "updatedAt": "2026-03-16T15:00:00.000Z"
}
```

### ExecutionLog
```json
{
  "id": 1,
  "scriptId": 1,
  "platform": "discord",
  "chatId": "123456789",
  "userId": "user123",
  "input": "{\"context\": {}}",
  "output": "Execution completed",
  "status": "success",
  "errorMessage": null,
  "executionTime": 150,
  "createdAt": "2026-03-16T15:00:00.000Z"
}
```

### AST Node Types

**PrimitiveOp:**
```json
{ "type": "sum", "left": 1, "right": 2, "target": "result" }
{ "type": "eq", "left": "{{user.premium}", "right": true }
{ "type": "gt", "left": "{{user.score}}", "right": 100 }
```

**UIOp:**
```json
{ "type": "say", "text": "Hello World" }
{ "type": "prompt", "text": "What's your name?", "variable": "userName" }
{ "type": "media", "url": "https://example.com/image.png", "caption": "Image" }
```

**FlowOp:**
```json
{ "type": "if", "condition": { "type": "eq", "left": "{{user.premium}", "right": true }, "then": [...], "else": [...] }
{ "type": "sequence", "nodes": [...] }
{ "type": "wait_input" }
```

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `202 Accepted` - Requisição aceita para processamento
- `204 No Content` - Sucesso sem conteúdo de resposta
- `400 Bad Request` - Erro de validação ou dados inválidos
- `401 Unauthorized` - Token ausente ou inválido
- `403 Forbidden` - Acesso negado
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro interno do servidor

---

## Exemplos de Uso

### 1. Criar e Executar um Script

**Passo 1: Registrar usuário**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Passo 2: Fazer login**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.access_token')
```

**Passo 3: Criar script**
```bash
curl -X POST http://localhost:3000/management/scripts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Greeting",
    "version": "1.0.0",
    "ast": {
      "type": "say",
      "text": "Hello from API!"
    }
  }'
```

**Passo 4: Executar script**
```bash
curl -X POST http://localhost:3000/management/execution/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scriptId": "1",
    "platform": "discord",
    "chatId": "123456789"
  }'
```

### 2. Webhook do Discord

Configurar o webhook no Discord Developer Portal para apontar para:
```
https://seu-dominio.com/webhook/discord
```

O Krasnaya-Core irá:
1. Receber o payload do Discord
2. Normalizar para o formato interno
3. Enfileirar para processamento assíncrono
4. Executar o script apropriado

---

## Taxonomia de Erros

### Erros de Validação (400)
```json
{
  "statusCode": 400,
  "message": ["name must be a string", "version is required"],
  "error": "Bad Request"
}
```

### Script Não Encontrado (404)
```json
{
  "statusCode": 404,
  "message": "Script with ID 999 not found",
  "error": "Not Found"
}
```

### Erro de Autenticação (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Erro de Execução (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---
