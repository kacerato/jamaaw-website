# 🚀 Guia Prático de Implementação - Sistema JAMAAW

Este guia fornece instruções passo a passo para implementar o sistema completo de login GitHub e upload de KMZ no site JAMAAW.

## 📋 Checklist de Implementação

### ✅ Fase 1: Configuração do Supabase

#### 1.1 Criar Projeto no Supabase
- [ ] Acesse [supabase.com](https://supabase.com)
- [ ] Crie uma nova conta ou faça login
- [ ] Clique em "New Project"
- [ ] Escolha uma organização
- [ ] Defina nome do projeto: `jamaaw-admin`
- [ ] Escolha uma senha forte para o banco
- [ ] Selecione região mais próxima (São Paulo)
- [ ] Aguarde a criação do projeto (2-3 minutos)

#### 1.2 Obter Credenciais
- [ ] Vá para **Settings > API**
- [ ] Copie a **Project URL**
- [ ] Copie a **anon public key**
- [ ] Anote essas informações para uso posterior

#### 1.3 Executar Scripts SQL
Execute os scripts na seguinte ordem no **SQL Editor**:

**Script 1: Estrutura Base**
```sql
-- Cole o conteúdo completo do arquivo supabase_setup.sql
```

**Script 2: Tabelas KMZ**
```sql
-- Cole o conteúdo completo do arquivo supabase_setup_kmz.sql
```

**Script 3: Administradores**
```sql
-- Cole o conteúdo completo do arquivo supabase_setup_admin.sql
```

#### 1.4 Configurar Storage
- [ ] Vá para **Storage** no painel lateral
- [ ] Clique em **Create a new bucket**
- [ ] Nome do bucket: `kmz-files`
- [ ] Deixe público: **Não** (apenas autenticados)
- [ ] Clique em **Create bucket**

#### 1.5 Configurar Políticas de Storage
Execute no SQL Editor:
```sql
-- Política para upload (usuários autenticados)
CREATE POLICY "Authenticated users can upload KMZ files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kmz-files' AND 
  auth.role() = 'authenticated'
);

-- Política para leitura (público)
CREATE POLICY "Public can view KMZ files" ON storage.objects
FOR SELECT USING (bucket_id = 'kmz-files');

-- Política para exclusão (usuários autenticados)
CREATE POLICY "Authenticated users can delete KMZ files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'kmz-files' AND 
  auth.role() = 'authenticated'
);
```

### ✅ Fase 2: Configuração do GitHub OAuth

#### 2.1 Criar Aplicação OAuth no GitHub
- [ ] Acesse [GitHub](https://github.com)
- [ ] Vá para **Settings > Developer settings**
- [ ] Clique em **OAuth Apps**
- [ ] Clique em **New OAuth App**
- [ ] Preencha os dados:
  - **Application name**: `JAMAAW Admin System`
  - **Homepage URL**: `https://seu-dominio.com` (ou localhost para testes)
  - **Application description**: `Sistema administrativo JAMAAW`
  - **Authorization callback URL**: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
- [ ] Clique em **Register application**
- [ ] Copie o **Client ID**
- [ ] Clique em **Generate a new client secret**
- [ ] Copie o **Client Secret** (não será mostrado novamente)

#### 2.2 Configurar GitHub no Supabase
- [ ] No Supabase, vá para **Authentication > Providers**
- [ ] Encontre **GitHub** na lista
- [ ] Ative o toggle **Enable sign in with GitHub**
- [ ] Cole o **Client ID** do GitHub
- [ ] Cole o **Client Secret** do GitHub
- [ ] Clique em **Save**

### ✅ Fase 3: Configuração dos Administradores

#### 3.1 Obter Dados do GitHub
Para cada administrador, obtenha:
- [ ] **GitHub ID**: Acesse `https://api.github.com/users/USERNAME`
- [ ] **Username**: Nome de usuário do GitHub
- [ ] **Email**: Email principal da conta GitHub
- [ ] **Nome completo**: Nome real da pessoa
- [ ] **Avatar URL**: `https://github.com/USERNAME.png`

#### 3.2 Inserir Administradores no Banco
Execute no SQL Editor do Supabase:
```sql
-- Substitua pelos dados reais
INSERT INTO admin_users (github_id, github_username, email, name, avatar_url) VALUES
(12345678, 'usuario1', 'admin1@exemplo.com', 'Nome Admin 1', 'https://github.com/usuario1.png'),
(87654321, 'usuario2', 'admin2@exemplo.com', 'Nome Admin 2', 'https://github.com/usuario2.png');
```

### ✅ Fase 4: Configuração do Projeto

#### 4.1 Instalar Dependências
```bash
cd JAMAAW_website_updated
npm install
```

#### 4.2 Configurar Variáveis de Ambiente
Crie o arquivo `.env.local`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-AQUI
```

#### 4.3 Atualizar Configuração do Supabase
Edite o arquivo `src/lib/supabase.ts`:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://SEU-PROJETO.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA-CHAVE-ANON'
```

### ✅ Fase 5: Testes e Validação

#### 5.1 Testar Localmente
```bash
npm run dev
```

#### 5.2 Testar Autenticação
- [ ] Acesse `http://localhost:5173/admin`
- [ ] Clique em "Entrar com GitHub"
- [ ] Autorize a aplicação
- [ ] Verifique se foi redirecionado para o painel
- [ ] Confirme que o nome e avatar aparecem corretamente

#### 5.3 Testar Upload KMZ
- [ ] Vá para a aba "Arquivos KMZ"
- [ ] Faça upload de um arquivo KMZ de teste
- [ ] Verifique se o processamento foi bem-sucedido
- [ ] Confirme que as coordenadas aparecem na lista
- [ ] Acesse o mapa público e verifique os marcadores

#### 5.4 Testar Funcionalidades Existentes
- [ ] Posts do blog funcionando
- [ ] Galeria funcionando
- [ ] FAQ funcionando
- [ ] Mapa interativo funcionando

### ✅ Fase 6: Deploy em Produção

#### 6.1 Build do Projeto
```bash
npm run build
```

#### 6.2 Atualizar URLs de Produção
- [ ] Atualize a **Authorization callback URL** no GitHub OAuth
- [ ] Atualize as variáveis de ambiente para produção
- [ ] Configure CORS no Supabase se necessário

#### 6.3 Deploy
- [ ] Faça upload dos arquivos da pasta `dist/`
- [ ] Configure servidor web (Nginx, Apache, etc.)
- [ ] Teste todas as funcionalidades em produção

## 🔧 Configurações Avançadas

### Personalização de Domínio
Se usar domínio personalizado:
1. Configure CNAME no DNS
2. Atualize URLs no GitHub OAuth
3. Configure SSL/TLS

### Backup e Monitoramento
1. Configure backups automáticos no Supabase
2. Configure alertas de uso
3. Monitore logs de autenticação

### Otimizações de Performance
1. Configure CDN para assets estáticos
2. Otimize imagens da galeria
3. Configure cache de coordenadas KMZ

## 🚨 Troubleshooting

### Erro: "Invalid redirect URI"
**Causa**: URL de callback incorreta no GitHub OAuth
**Solução**: Verifique se a URL no GitHub OAuth está exatamente igual à do Supabase

### Erro: "User not authorized"
**Causa**: Usuário não está na tabela admin_users
**Solução**: Adicione o usuário na tabela admin_users com os dados corretos do GitHub

### Erro: "Storage bucket not found"
**Causa**: Bucket kmz-files não foi criado
**Solução**: Crie o bucket no painel Storage do Supabase

### Erro: "Failed to process KMZ file"
**Causa**: Arquivo KMZ inválido ou políticas de storage incorretas
**Solução**: Verifique se o arquivo é um KMZ válido e se as políticas estão configuradas

### Coordenadas não aparecem no mapa
**Causa**: Arquivo não foi processado ou erro na extração
**Solução**: Verifique logs no console e confirme que o arquivo foi processado com sucesso

## 📞 Suporte Técnico

### Logs Importantes
- **Console do navegador**: Erros de JavaScript
- **Supabase Logs**: Erros de banco e autenticação
- **Network tab**: Problemas de requisições

### Comandos Úteis
```bash
# Verificar dependências
npm list

# Limpar cache
npm run build -- --force

# Verificar tipos TypeScript
npx tsc --noEmit
```

### Recursos de Ajuda
- [Documentação Supabase](https://supabase.com/docs)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

**✅ Implementação Concluída!**

Após seguir todos os passos, você terá um sistema completo de:
- ✅ Autenticação GitHub OAuth
- ✅ Upload e processamento de arquivos KMZ
- ✅ Mapa interativo com coordenadas automáticas
- ✅ Painel administrativo profissional
- ✅ Controle de acesso seguro

