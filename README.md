# JAMAAW - Site Aprimorado com Sistema Administrativo Avançado

Site profissional para a JAMAAW (Organização de Cabeamento) com funcionalidades avançadas, sistema administrativo completo, autenticação GitHub e gerenciamento de arquivos KMZ.

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Autenticação GitHub OAuth
- **Login via GitHub**: Autenticação segura usando conta GitHub
- **Controle de Acesso**: Apenas emails/contas autorizadas podem acessar o painel administrativo
- **Sessão Persistente**: Login mantido entre sessões do navegador
- **Logout Seguro**: Encerramento completo da sessão

### ✅ Gerenciamento de Arquivos KMZ
- **Upload de Arquivos**: Interface drag-and-drop para arquivos KMZ
- **Processamento Automático**: Extração automática de coordenadas dos arquivos
- **Validação**: Verificação de formato e tamanho dos arquivos (máximo 10MB)
- **Visualização**: Exibição das coordenadas extraídas em interface profissional
- **Exclusão**: Remoção segura de arquivos e coordenadas

### ✅ Mapa Interativo Leaflet Aprimorado
- **Integração Automática**: Coordenadas KMZ aparecem automaticamente no mapa
- **Marcadores Diferenciados**: Ícones distintos para ruas e coordenadas KMZ
- **Popups Informativos**: Detalhes completos ao clicar nos marcadores
- **Estatísticas em Tempo Real**: Contadores de ruas e coordenadas
- **Atualização Dinâmica**: Refresh automático após uploads

### ✅ Painel Administrativo Profissional
- **Dashboard Completo**: Visão geral de todos os dados com estatísticas
- **Gerenciamento de Conteúdo**: Posts, galeria, FAQ e arquivos KMZ
- **Interface Moderna**: Design profissional e responsivo
- **Aba KMZ Dedicada**: Gerenciamento completo de arquivos KMZ
- **Configurações**: Informações do sistema e usuário

### ✅ Galeria "Antes e Depois"
- Sistema completo de galeria com fotos e vídeos
- Interface administrativa para upload e gerenciamento
- Visualização responsiva e otimizada

### ✅ Sistema de Blog Personalizável
- Editor completo para posts
- Sistema de categorias
- Upload de imagens
- Publicação/rascunho
- Interface administrativa intuitiva

### ✅ Integração com Redes Sociais
- Links flutuantes e no footer
- Gerenciamento via painel administrativo
- Suporte a Instagram, Facebook, LinkedIn, WhatsApp

### ✅ Busca Avançada no Mapa
- Filtros por status, bairro e nome
- Interface interativa e responsiva
- Visualização em tempo real do progresso

### ✅ Chatbot/FAQ Interativo
- Sistema de perguntas frequentes
- Interface flutuante e embarcada
- Busca inteligente nas perguntas
- Gerenciamento via admin

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Leaflet** para mapas interativos
- **Lucide React** para ícones
- **React Router** para navegação

### Backend & Banco de Dados
- **Supabase** como backend completo
- **PostgreSQL** para armazenamento de dados
- **Supabase Auth** para autenticação GitHub
- **Supabase Storage** para arquivos KMZ

### Processamento de Arquivos
- **JSZip** para extração de arquivos KMZ
- **DOMParser** para parsing de KML
- **Validação de coordenadas** automática

## 📦 Instalação e Configuração

### 1. Configuração do Supabase

#### Configuração do Banco de Dados
Execute os scripts SQL fornecidos na seguinte ordem:

```sql
-- 1. Execute o arquivo: supabase_setup.sql
-- 2. Execute o arquivo: supabase_setup_kmz.sql  
-- 3. Execute o arquivo: supabase_setup_admin.sql
```

#### Configuração do Storage
1. No painel do Supabase, vá para **Storage**
2. Crie um bucket chamado `kmz-files`
3. Configure as políticas de acesso para usuários autenticados

#### Configuração da Autenticação GitHub
1. No painel do Supabase, vá para **Authentication > Providers**
2. Ative o provedor **GitHub**
3. Configure com as credenciais da sua aplicação GitHub OAuth

### 2. Configuração do GitHub OAuth

#### Criação da Aplicação OAuth
1. Acesse **GitHub > Settings > Developer settings > OAuth Apps**
2. Clique em **New OAuth App**
3. Preencha os dados:
   - **Application name**: JAMAAW Admin
   - **Homepage URL**: https://seu-dominio.com
   - **Authorization callback URL**: https://seu-projeto.supabase.co/auth/v1/callback

### 3. Configuração dos Administradores

Execute no SQL Editor do Supabase para adicionar administradores:

```sql
-- Substitua pelos dados reais dos administradores
INSERT INTO admin_users (github_id, github_username, email, name, avatar_url) VALUES
(12345678, 'seu-usuario-github', 'seu-email@exemplo.com', 'Seu Nome', 'https://github.com/seu-usuario.png');
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 6. Executar em Desenvolvimento

```bash
npm run dev
```

### 7. Build para Produção

```bash
npm run build
```

## 🔐 Acesso Administrativo

### Como Acessar o Painel Admin:

1. Vá para `/admin` ou clique no botão "Entrar" no header
2. Clique em "Entrar com GitHub"
3. Autorize a aplicação (primeira vez)
4. Será redirecionado para o painel (se autorizado)

### Funcionalidades do Admin:

- **Visão Geral**: Dashboard com estatísticas completas
- **Posts do Blog**: Criar, editar, publicar posts
- **Galeria**: Upload e organização de fotos/vídeos
- **FAQ**: Gerenciar perguntas e respostas
- **Arquivos KMZ**: Upload, processamento e gerenciamento de coordenadas
- **Configurações**: Informações do sistema e usuário

## 📁 Como Usar o Sistema KMZ

### Upload de Arquivos KMZ

1. **Acesso**: Vá para a aba "Arquivos KMZ" no painel administrativo
2. **Upload**: Clique em "Upload KMZ" ou arraste arquivos para a área
3. **Processamento**: Aguarde a extração automática das coordenadas
4. **Visualização**: Veja as coordenadas extraídas e estatísticas

### Visualização no Mapa

1. **Acesso**: Vá para a página do mapa no site público
2. **Marcadores**: 
   - Verde grande: Ruas concluídas (banco de dados)
   - Verde pequeno: Coordenadas de arquivos KMZ
   - Amarelo: Ruas em andamento
   - Vermelho: Ruas planejadas
3. **Interação**: Clique nos marcadores para ver detalhes completos

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas para Sistema KMZ

#### `admin_users`
- Armazena informações dos administradores autorizados
- Campos: github_id, github_username, email, name, avatar_url

#### `kmz_files`
- Registra arquivos KMZ enviados
- Campos: filename, original_name, file_size, storage_path, processed

#### `kmz_coordinates`
- Armazena coordenadas extraídas dos arquivos KMZ
- Campos: kmz_file_id, latitude, longitude, name, description

## 📱 Responsividade

O site foi otimizado para todos os dispositivos:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🔒 Segurança

### Autenticação
- OAuth 2.0 via GitHub
- Tokens JWT gerenciados pelo Supabase
- Sessões seguras com refresh automático

### Autorização
- Lista de administradores no banco de dados
- Verificação de permissões em cada requisição
- Middleware de proteção de rotas

### Upload de Arquivos
- Validação de tipo de arquivo (.kmz apenas)
- Limite de tamanho (10MB)
- Sanitização de nomes de arquivo
- Storage isolado no Supabase

## 🐛 Solução de Problemas

### Erro de Autenticação
```
Erro: "Usuário não autorizado"
```
**Solução**: Verifique se o email/username está na tabela `admin_users`

### Erro de Upload KMZ
```
Erro: "Erro ao processar arquivo KMZ"
```
**Soluções**:
- Verifique se o arquivo é um KMZ válido
- Confirme que o bucket `kmz-files` existe no Supabase
- Verifique as políticas de storage

### Coordenadas não aparecem no mapa
**Soluções**:
- Clique em "Atualizar KMZ" no mapa (modo admin)
- Verifique se o arquivo foi processado com sucesso
- Confirme que as coordenadas estão na tabela `kmz_coordinates`

## 🎨 Design

- Mantém o padrão de excelência do site original
- Interface moderna e profissional com foco em usabilidade
- Animações suaves e micro-interações
- Cores consistentes com a identidade da JAMAAW
- Design system coeso em todo o painel administrativo

## 📊 Funcionalidades Futuras

O site está preparado para receber:
- Backup automático de arquivos KMZ
- Histórico de uploads e modificações
- Notificações por email para novos uploads
- API REST para integração externa
- Suporte a outros formatos (GPX, GeoJSON)

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa em `CONFIGURACAO_SUPABASE_COMPLETA.md`
2. Verifique os logs no console do navegador
3. Acesse o painel do Supabase para gerenciar dados
4. Monitore logs de autenticação e storage

## 📝 Changelog

### Versão 3.0 (Janeiro 2025) - Sistema KMZ e GitHub Auth
- ✅ **Sistema de Autenticação GitHub OAuth** implementado
- ✅ **Upload e processamento de arquivos KMZ** completo
- ✅ **Integração automática com mapa Leaflet** aprimorada
- ✅ **Painel administrativo profissional** redesenhado
- ✅ **Controle de acesso granular** por administradores
- ✅ **Interface drag-and-drop** para uploads
- ✅ **Estatísticas em tempo real** no mapa e dashboard
- ✅ **Validação e segurança** de arquivos aprimorada

### Versão 2.0 (Janeiro 2025)
- ✅ Galeria "Antes e Depois" implementada
- ✅ Sistema de blog completo
- ✅ Integração com redes sociais
- ✅ Busca avançada no mapa
- ✅ Chatbot/FAQ interativo
- ✅ Dashboard administrativo
- ✅ Otimizações mobile
- ✅ Integração com Supabase

---

**JAMAAW - Organização Profissional de Cabeamento**
*Licenciada pela Prefeitura de Maceió*

**Sistema Administrativo Avançado** - Gerenciamento completo com autenticação GitHub e processamento automático de arquivos KMZ para atualização do mapa interativo.

