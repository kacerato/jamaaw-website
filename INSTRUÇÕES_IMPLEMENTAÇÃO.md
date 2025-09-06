# Instruções de Implementação - JAMAAW Website

## Resumo das Alterações

Este projeto foi atualizado com as seguintes funcionalidades:

1. **Nova Tela de Login Personalizada**: Substituição do login do Google por uma tela de login customizada usando Supabase
2. **Funcionalidade de Upload de KMZ**: Sistema completo para upload e gerenciamento de arquivos KMZ
3. **Integração com Mapa Leaflet**: Exibição dinâmica das coordenadas dos arquivos KMZ no mapa interativo

## Configuração do Supabase

### 1. Atualizar Credenciais
As credenciais do Supabase já foram atualizadas no arquivo `src/lib/supabase.ts` com:
- URL: `https://peyxawxonsacpaowgqxx.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleXhhd3hvbnNhY3Bhb3dncXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1MzIsImV4cCI6MjA3MDUzMDUzMn0.8S2MpPLnO4R75h7ckDQ00f1V_zOWBm-L53d3vFYh8YA`

### 2. Executar Scripts SQL
Execute os seguintes scripts no painel do Supabase (SQL Editor):

1. **Tabelas existentes**: Execute `supabase_setup.sql` (se ainda não foi executado)
2. **Tabelas para KMZ**: Execute `supabase_setup_kmz.sql` para criar as tabelas necessárias para o sistema de KMZ

### 3. Configurar Storage
No painel do Supabase, vá para Storage e:
1. Crie um bucket chamado `kmz-files`
2. Configure as políticas de acesso conforme comentado no arquivo `supabase_setup_kmz.sql`

### 4. Criar Usuário Administrador
No painel do Supabase, vá para Authentication > Users e crie um usuário administrador:
- Email: `admin@jamaaw.com` (ou outro email de sua escolha)
- Senha: Defina uma senha segura
- Confirme o email manualmente no painel

## Novas Funcionalidades

### 1. Sistema de Login Personalizado
- **Rota**: `/login`
- **Componente**: `CustomLoginForm.tsx`
- **Funcionalidade**: Login com email/senha usando Supabase Auth
- **Redirecionamento**: Após login bem-sucedido, redireciona para `/admin`

### 2. Upload e Processamento de Arquivos KMZ
- **Localização**: Painel Administrativo > Aba "Arquivos KMZ"
- **Componentes**: 
  - `KmzUploader.tsx`: Modal de upload
  - `KmzManager.tsx`: Gerenciamento de arquivos
  - `kmzParser.ts`: Lógica para parsing real de arquivos KMZ
- **Funcionalidades**:
  - Upload de arquivos KMZ (máximo 10MB)
  - **Processamento real de KMZ**: Extrai coordenadas de arquivos KMZ (KML, LineString, Polygon) usando `jszip` e `fast-xml-parser`.
  - Armazenamento no Supabase Storage
  - Visualização de coordenadas extraídas
  - Exclusão de arquivos

### 3. Integração com Mapa Leaflet
- **Atualização**: `LeafletMap.tsx` agora carrega coordenadas do banco de dados
- **Marcadores**: Coordenadas KMZ aparecem com ícones verdes diferenciados
- **Atualização Dinâmica**: Mapa atualiza automaticamente após upload de novos arquivos

## Estrutura de Arquivos Novos/Modificados

```
src/
├── lib/
│   ├── supabase.ts (atualizado)
│   ├── kmzProcessor.ts (atualizado)
│   └── kmzParser.ts (novo)
├── react-app/
│   ├── components/
│   │   ├── AuthProvider.tsx (existente)
│   │   ├── CustomLoginForm.tsx (novo)
│   │   ├── KmzUploader.tsx (atualizado)
│   │   ├── KmzManager.tsx (atualizado)
│   │   ├── LeafletMap.tsx (atualizado)
│   │   └── RefreshableLeafletMap.tsx (novo)
│   ├── pages/
│   │   ├── Admin.tsx (atualizado)
│   │   ├── CustomLogin.tsx (novo)
│   │   └── App.tsx (atualizado)
```

## Como Testar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

### 3. Testar Funcionalidades

#### Login Personalizado:
1. Acesse `/login`
2. Use as credenciais do usuário administrador criado no Supabase
3. Verifique redirecionamento para `/admin`

#### Upload de KMZ:
1. Acesse `/admin` (após login)
2. Vá para a aba "Arquivos KMZ"
3. Clique em "Upload KMZ"
4. Selecione um arquivo .kmz **real** (com dados de coordenadas)
5. Verifique upload e processamento

#### Visualização no Mapa:
1. Acesse `/mapa`
2. Verifique se as coordenadas KMZ aparecem no mapa
3. Clique nos marcadores para ver informações

## Observações Importantes

### 1. Processamento de KMZ
O sistema agora realiza o **parsing real** de arquivos KMZ. Ele extrai coordenadas de `Point`, `LineString` e `Polygon` (apenas o limite externo por simplicidade). Certifique-se de que seus arquivos KMZ contêm esses tipos de geometria.

### 2. Autenticação
O sistema usa o AuthProvider personalizado que se conecta diretamente ao Supabase. Certifique-se de que:
- As credenciais do Supabase estão corretas
- O usuário administrador foi criado
- As políticas RLS estão configuradas corretamente

### 3. Deployment
Para fazer deploy:
1. Configure as variáveis de ambiente do Supabase
2. Execute `npm run build`
3. Deploy os arquivos da pasta `dist`

## Suporte

Se encontrar problemas:
1. Verifique as credenciais do Supabase
2. Confirme que os scripts SQL foram executados
3. Verifique o console do navegador para erros
4. Confirme que o bucket `kmz-files` foi criado no Storage

## Próximos Passos

Para melhorar o sistema:
1. Adicionar validação mais robusta de arquivos KMZ (ex: verificar estrutura KML)
2. Implementar cache para melhor performance
3. Adicionar logs de auditoria
4. Implementar backup automático dos arquivos

