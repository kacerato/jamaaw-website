# JAMAAW - Sistema de Gerenciamento Administrativo

Sistema completo para gerenciamento administrativo da JAMAAW com funcionalidades de upload e processamento de arquivos KMZ, visualização em mapa interativo e autenticação segura.

## 🚀 Funcionalidades

### ✅ Sistema de Autenticação
- **Login por Email/Senha**: Autenticação segura com JWT
- **Controle de Acesso**: Apenas administradores autorizados
- **Sessão Persistente**: Login mantido entre sessões
- **Logout Seguro**: Encerramento completo da sessão

### ✅ Gerenciamento de Arquivos KMZ
- **Upload de Arquivos**: Interface drag-and-drop para arquivos KMZ
- **Processamento Automático**: Extração automática de coordenadas
- **Validação**: Verificação de formato e tamanho (máximo 16MB)
- **Visualização**: Exibição das coordenadas extraídas
- **Exclusão**: Remoção segura de arquivos e coordenadas

### ✅ Mapa Interativo
- **Integração Automática**: Coordenadas KMZ aparecem automaticamente
- **Marcadores Diferenciados**: Ícones distintos para coordenadas KMZ
- **Popups Informativos**: Detalhes completos ao clicar nos marcadores
- **Estatísticas em Tempo Real**: Contadores de arquivos e coordenadas
- **Atualização Dinâmica**: Refresh automático após uploads

### ✅ Painel Administrativo
- **Dashboard Completo**: Visão geral com estatísticas
- **Gerenciamento de Arquivos**: Upload, visualização e exclusão
- **Interface Moderna**: Design responsivo e profissional
- **Navegação por Abas**: Organização intuitiva das funcionalidades

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **PostgreSQL** - Banco de dados principal
- **JWT** - Autenticação e autorização
- **bcrypt** - Hash de senhas
- **psycopg2** - Conexão com PostgreSQL

### Frontend
- **React 19** - Interface de usuário
- **Tailwind CSS** - Estilização
- **Leaflet** - Mapas interativos
- **Axios** - Requisições HTTP
- **Lucide React** - Ícones

### Processamento de Arquivos
- **zipfile** - Extração de arquivos KMZ
- **xml.etree.ElementTree** - Parsing de KML
- **Validação automática** de coordenadas

## 📦 Instalação e Configuração

### 1. Pré-requisitos
- Python 3.11+
- PostgreSQL
- Node.js 18+ (para desenvolvimento do frontend)

### 2. Configuração do Banco de Dados
O sistema está configurado para usar PostgreSQL. A string de conexão está em `src/config.py`.

### 3. Instalação das Dependências
```bash
pip install -r requirements.txt
```

### 4. Configuração das Variáveis de Ambiente
Crie um arquivo `.env` ou configure as seguintes variáveis:

```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### 5. Executar a Aplicação
```bash
python src/main.py
```

A aplicação estará disponível em `http://localhost:5000`

## 🔐 Credenciais de Acesso

### Administrador Padrão
- **Email**: admin@jamaaw.com
- **Senha**: jamaaw123

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

## 📁 Estrutura do Projeto

```
jamaaw-complete/
├── src/
│   ├── models/          # Modelos de dados
│   │   ├── auth.py      # Autenticação
│   │   └── kmz.py       # Gerenciamento KMZ
│   ├── routes/          # Rotas da API
│   │   ├── auth.py      # Endpoints de autenticação
│   │   └── kmz.py       # Endpoints KMZ
│   ├── static/          # Frontend React (build)
│   ├── uploads/         # Arquivos KMZ enviados
│   ├── config.py        # Configurações
│   ├── database.py      # Conexão com banco
│   └── main.py          # Aplicação principal
├── requirements.txt     # Dependências Python
└── README.md           # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
- Armazena informações dos usuários
- Campos: id, email, name, password_hash, created_at

#### `admin_users`
- Registra administradores autorizados
- Campos: id, user_id, is_active, is_super_admin, created_at

#### `kmz_files`
- Registra arquivos KMZ enviados
- Campos: id, filename, original_name, file_size, storage_path, processed

#### `kmz_coordinates`
- Armazena coordenadas extraídas dos arquivos KMZ
- Campos: id, kmz_file_id, latitude, longitude, name, description

## 🔒 Segurança

### Autenticação
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração
- Verificação de permissões em cada requisição

### Upload de Arquivos
- Validação de tipo de arquivo (.kmz apenas)
- Limite de tamanho (16MB)
- Sanitização de nomes de arquivo
- Armazenamento seguro no servidor

## 📱 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Dados do usuário atual

### KMZ
- `POST /api/kmz/upload` - Upload de arquivo KMZ
- `GET /api/kmz/files` - Listar arquivos
- `GET /api/kmz/files/{id}` - Detalhes do arquivo
- `DELETE /api/kmz/files/{id}` - Deletar arquivo
- `GET /api/kmz/coordinates` - Listar coordenadas
- `GET /api/kmz/stats` - Estatísticas

## 🚀 Deploy

### Vercel (Recomendado)
1. Faça push do código para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático

### Render
1. Conecte o repositório no Render
2. Configure como Web Service
3. Comando de build: `pip install -r requirements.txt`
4. Comando de start: `python src/main.py`

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique a string de conexão em `src/config.py`
- Confirme que o PostgreSQL está rodando
- Verifique as credenciais de acesso

### Erro de Upload KMZ
- Confirme que o arquivo é um KMZ válido
- Verifique o tamanho do arquivo (máximo 16MB)
- Verifique permissões da pasta `src/uploads/`

### Coordenadas não aparecem no mapa
- Clique em "Atualizar" no mapa
- Verifique se o arquivo foi processado com sucesso
- Confirme que as coordenadas estão no banco de dados

## 📊 Monitoramento

### Logs
- Logs de erro são exibidos no console
- Logs de upload e processamento são registrados
- Logs de autenticação para auditoria

### Estatísticas
- Total de arquivos enviados
- Total de coordenadas extraídas
- Arquivos processados vs pendentes
- Dashboard em tempo real

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no console
2. Confirme a configuração do banco de dados
3. Teste a conectividade da API
4. Verifique as permissões de arquivo

---

**JAMAAW - Sistema de Gerenciamento Administrativo**
*Desenvolvido com Flask, React e PostgreSQL*

**Credenciais de Acesso**: admin@jamaaw.com / jamaaw123

