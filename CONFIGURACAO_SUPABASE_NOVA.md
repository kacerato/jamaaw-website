# Configuração do Novo Projeto Supabase - JAMAAW Website

## Informações do Projeto

- **Nome do Projeto**: kacerato's Project
- **Organização**: JAMAAW_website_test
- **URL do Projeto**: https://xhbmcayspdeetcdmzpxm.supabase.co
- **ID do Projeto**: xhbmcayspdeetcdmzpxm

## Credenciais da API

- **URL**: https://xhbmcayspdeetcdmzpxm.supabase.co
- **Chave Pública (anon)**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYm1jYXlzcGRlZXRjZG16cHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDczOTEsImV4cCI6MjA3MTI4MzM5MX0.YqGdHGdKhLqHNlJtTnRrCf6IkpXVCj9-eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoYm1jYXlzcGRlZXRjZG16cHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDczOTEsImV4cCI6MjA3MTI4MzM5MX0

## Tabelas Criadas

### 1. Tabelas do Blog e Conteúdo
- `blog_categories` - Categorias do blog
- `blog_posts` - Posts do blog
- `gallery_items` - Galeria de fotos/vídeos
- `faqs` - Perguntas frequentes
- `social_links` - Links das redes sociais

### 2. Tabelas do Sistema de Mapeamento
- `streets` - Ruas para organização de cabeamento
- `street_suggestions` - Sugestões de ruas dos usuários
- `admin_users` - Usuários administradores

### 3. Tabelas para Arquivos KMZ
- `kmz_files` - Informações dos arquivos KMZ
- `kmz_coordinates` - Coordenadas extraídas dos arquivos KMZ

## Correções Realizadas

1. **Problema Original**: Erro "column streets.created_at does not exist"
2. **Solução**: Criação de novo projeto Supabase com todas as tabelas necessárias
3. **Atualização**: Arquivo `src/lib/supabase.ts` atualizado com novas credenciais
4. **Configuração**: Row Level Security (RLS) habilitado em todas as tabelas
5. **Políticas**: Políticas de segurança configuradas para acesso público de leitura e acesso completo para usuários autenticados

## Próximos Passos

1. Teste o site localmente para verificar se o erro foi corrigido
2. Se necessário, configure autenticação no Supabase
3. Adicione dados de exemplo nas tabelas para teste
4. Configure o Storage do Supabase se necessário para upload de arquivos KMZ

## Observações Importantes

- O projeto está configurado na região East US (Ohio)
- Todas as tabelas têm timestamps automáticos (created_at, updated_at)
- As políticas de segurança permitem leitura pública mas escrita apenas para usuários autenticados
- O erro original foi causado pela falta da tabela `streets` no banco de dados anterior

