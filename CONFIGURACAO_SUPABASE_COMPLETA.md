# Configuração Completa do Supabase - JAMAAW Website

## Visão Geral

Este documento contém todas as instruções necessárias para configurar o banco de dados Supabase para o site JAMAAW com as seguintes funcionalidades:

1. **Autenticação via GitHub** - Sistema de login usando OAuth do GitHub
2. **Painel Administrativo** - Interface para gerenciar conteúdo do site
3. **Upload de KMZ** - Sistema para upload e processamento de arquivos KMZ
4. **Mapa Interativo** - Integração com Leaflet para exibir coordenadas

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Aplicação GitHub OAuth configurada

## Configuração Inicial do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Defina um nome para o projeto (ex: "jamaaw-website")
5. Defina uma senha para o banco de dados
6. Escolha a região mais próxima (ex: South America - São Paulo)
7. Clique em "Create new project"

### 2. Obter Credenciais

Após a criação do projeto, vá para Settings > API e anote:
- **Project URL**: `https://[seu-projeto].supabase.co`
- **API Key (anon/public)**: Chave pública para uso no frontend
- **API Key (service_role)**: Chave privada para operações administrativas

## Configuração da Autenticação GitHub

### 1. Criar Aplicação OAuth no GitHub

1. Acesse GitHub > Settings > Developer settings > OAuth Apps
2. Clique em "New OAuth App"
3. Preencha os dados:
   - **Application name**: JAMAAW Website Admin
   - **Homepage URL**: https://seu-dominio.com
   - **Authorization callback URL**: `https://[seu-projeto].supabase.co/auth/v1/callback`
4. Clique em "Register application"
5. Anote o **Client ID** e **Client Secret**

### 2. Configurar GitHub no Supabase

1. No painel do Supabase, vá para Authentication > Providers
2. Encontre "GitHub" na lista de provedores
3. Ative o GitHub provider
4. Insira o **Client ID** e **Client Secret** obtidos do GitHub
5. Configure a **Redirect URL**: `https://[seu-projeto].supabase.co/auth/v1/callback`
6. Salve as configurações

## Scripts SQL para Configuração do Banco

Execute os seguintes scripts na ordem apresentada no SQL Editor do Supabase:

### Script 1: Configuração Inicial (supabase_setup.sql)
```sql
-- Este script já existe no projeto, execute-o primeiro
-- Cria tabelas para blog, galeria, FAQ, etc.
```

### Script 2: Configuração KMZ (supabase_setup_kmz.sql)
```sql
-- Este script já existe no projeto, execute-o segundo
-- Cria tabelas para arquivos KMZ e coordenadas
```

### Script 3: Configuração de Administradores
```sql
-- Criar tabela para administradores autorizados
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    github_id BIGINT UNIQUE NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam apenas seus próprios dados
CREATE POLICY "Users can view their own admin data" ON admin_users
FOR SELECT USING (auth.uid()::text = github_id::text);

-- Política para inserir novos administradores (apenas durante o primeiro login)
CREATE POLICY "Allow insert for new admin users" ON admin_users
FOR INSERT WITH CHECK (auth.uid()::text = github_id::text);

-- Política para atualizar dados do próprio usuário
CREATE POLICY "Users can update their own admin data" ON admin_users
FOR UPDATE USING (auth.uid()::text = github_id::text);

-- Função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION is_admin_user(user_github_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE github_id = user_github_id AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar last_login automaticamente
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_last_login_trigger
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_last_login();
```

## Configuração do Storage

### 1. Criar Bucket para Arquivos KMZ

1. No painel do Supabase, vá para Storage
2. Clique em "Create bucket"
3. Nome do bucket: `kmz-files`
4. Deixe "Public bucket" desmarcado (privado)
5. Clique em "Create bucket"

### 2. Configurar Políticas do Storage

Execute no SQL Editor:

```sql
-- Política para upload de arquivos KMZ (apenas administradores)
CREATE POLICY "Admin users can upload KMZ files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'kmz-files' 
    AND auth.role() = 'authenticated'
    AND is_admin_user((auth.jwt() ->> 'user_metadata' ->> 'provider_id')::BIGINT)
);

-- Política para visualizar arquivos KMZ (apenas administradores)
CREATE POLICY "Admin users can view KMZ files" ON storage.objects
FOR SELECT USING (
    bucket_id = 'kmz-files' 
    AND auth.role() = 'authenticated'
    AND is_admin_user((auth.jwt() ->> 'user_metadata' ->> 'provider_id')::BIGINT)
);

-- Política para deletar arquivos KMZ (apenas administradores)
CREATE POLICY "Admin users can delete KMZ files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'kmz-files' 
    AND auth.role() = 'authenticated'
    AND is_admin_user((auth.jwt() ->> 'user_metadata' ->> 'provider_id')::BIGINT)
);
```

## Configuração de Usuários Administradores

### 1. Adicionar Administradores Autorizados

Execute no SQL Editor para adicionar usuários que podem acessar o painel administrativo:

```sql
-- Substitua os valores pelos dados reais dos administradores
INSERT INTO admin_users (github_id, github_username, email, name) VALUES
(123456789, 'seu-usuario-github', 'seu-email@exemplo.com', 'Seu Nome'),
(987654321, 'outro-admin', 'admin@jamaaw.com', 'Administrador JAMAAW');
```

**Importante**: Para obter o `github_id`, você pode:
1. Acessar a API do GitHub: `https://api.github.com/users/[username]`
2. O campo `id` é o `github_id` necessário

### 2. Configurar Redirecionamento Pós-Login

No painel do Supabase, vá para Authentication > URL Configuration:
- **Site URL**: https://seu-dominio.com
- **Redirect URLs**: 
  - https://seu-dominio.com/auth/callback
  - http://localhost:3000/auth/callback (para desenvolvimento)

## Atualização do Código

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-publica]
VITE_GITHUB_CLIENT_ID=[client-id-do-github]
```

### 2. Atualizar Configuração do Supabase

No arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Testando a Configuração

### 1. Verificar Conexão com Banco

Execute no console do navegador:

```javascript
// Testar conexão
const { data, error } = await supabase.from('admin_users').select('*')
console.log('Conexão:', error ? 'Erro' : 'Sucesso', data)
```

### 2. Testar Autenticação GitHub

1. Acesse a página de login
2. Clique em "Login com GitHub"
3. Autorize a aplicação
4. Verifique se o redirecionamento funciona
5. Confirme se o usuário aparece na tabela `admin_users`

### 3. Testar Upload de KMZ

1. Faça login como administrador
2. Acesse o painel administrativo
3. Vá para a seção de KMZ
4. Teste o upload de um arquivo .kmz
5. Verifique se o arquivo aparece no Storage e as coordenadas na tabela

## Solução de Problemas

### Erro de CORS
- Verifique se as URLs de redirecionamento estão corretas
- Confirme se o domínio está autorizado no GitHub OAuth

### Erro de Autenticação
- Verifique se o Client ID e Secret do GitHub estão corretos
- Confirme se o usuário está na tabela `admin_users`

### Erro de Upload
- Verifique se o bucket `kmz-files` foi criado
- Confirme se as políticas de Storage estão ativas
- Teste se o usuário tem permissões de administrador

### Erro de Mapa
- Verifique se as coordenadas estão sendo salvas na tabela `kmz_coordinates`
- Confirme se a API do Leaflet está carregando corretamente

## Próximos Passos

Após completar esta configuração:

1. **Desenvolvimento**: Configure o ambiente local com as variáveis de ambiente
2. **Testes**: Execute todos os testes de funcionalidade
3. **Deploy**: Configure o ambiente de produção
4. **Monitoramento**: Configure logs e alertas no Supabase
5. **Backup**: Configure backup automático dos dados

## Segurança

### Recomendações Importantes:

1. **Nunca exponha** a chave `service_role` no frontend
2. **Use HTTPS** em produção
3. **Configure Rate Limiting** no Supabase
4. **Monitore** logs de autenticação
5. **Mantenha** as dependências atualizadas
6. **Faça backup** regular dos dados

## Suporte

Para problemas específicos:
1. Consulte a documentação do Supabase: https://supabase.com/docs
2. Verifique os logs no painel do Supabase
3. Teste as consultas SQL diretamente no SQL Editor
4. Confirme as configurações de autenticação e storage

