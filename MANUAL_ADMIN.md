# Manual do Administrador - JAMAAW

## 🔐 Como Acessar o Painel Administrativo

### 1. Acesso ao Sistema
- Vá para o site da JAMAAW
- Clique no botão **"Login"** no canto superior direito
- Ou acesse diretamente: `seu-site.com/admin`

### 2. Credenciais de Login
- **Email**: Use o email configurado como administrador no Supabase
- **Senha**: Use a senha definida no sistema de autenticação

### 3. Primeiro Acesso
Se ainda não tem credenciais de administrador:
1. Acesse o painel do Supabase
2. Vá em "Authentication" > "Users"
3. Crie um novo usuário ou configure um existente como admin

---

## 📝 Gerenciamento do Blog

### Criar um Novo Post
1. No painel admin, clique na aba **"Posts"**
2. Clique no botão **"+ Novo Post"**
3. Preencha os campos:
   - **Título**: Título do post
   - **Conteúdo**: Texto completo (suporte a Markdown)
   - **Resumo**: Breve descrição para listagens
   - **Categoria**: Selecione uma categoria existente
   - **Imagem Destacada**: URL da imagem principal
   - **Tags**: Palavras-chave separadas por vírgula
   - **Publicado**: Marque para publicar imediatamente

### Editar um Post Existente
1. Na lista de posts, clique no ícone de **edição** (lápis)
2. Modifique os campos desejados
3. Clique em **"Salvar"**

### Gerenciar Categorias
1. Vá para a aba **"Categorias"**
2. Crie novas categorias ou edite existentes
3. Cada categoria tem:
   - **Nome**: Nome exibido
   - **Slug**: URL amigável (gerado automaticamente)
   - **Descrição**: Descrição opcional

---

## 🖼️ Gerenciamento da Galeria

### Adicionar Fotos "Antes e Depois"
1. Clique na aba **"Galeria"**
2. Clique em **"+ Novo Item"**
3. Preencha:
   - **Título**: Nome do projeto
   - **Descrição**: Detalhes do trabalho realizado
   - **Foto Antes**: URL da imagem antes do trabalho
   - **Foto Depois**: URL da imagem após o trabalho
   - **Localização**: Endereço ou bairro
   - **Data do Projeto**: Quando foi realizado
   - **Destacado**: Marque para aparecer na página inicial

### Upload de Imagens
Para fazer upload de imagens:
1. Use o painel do Supabase Storage
2. Ou use um serviço como Imgur, Cloudinary
3. Cole a URL no campo correspondente

---

## ❓ Gerenciamento do FAQ

### Adicionar Perguntas Frequentes
1. Vá para a aba **"FAQ"**
2. Clique em **"+ Nova Pergunta"**
3. Preencha:
   - **Pergunta**: A pergunta completa
   - **Resposta**: Resposta detalhada
   - **Categoria**: Para organização (ex: "Serviços", "Sobre")
   - **Ordem**: Número para ordenação
   - **Ativo**: Marque para exibir no site

### Organizar Perguntas
- Use o campo **"Ordem"** para definir a sequência
- Números menores aparecem primeiro
- Agrupe por categorias para melhor organização

---

## 🌐 Gerenciamento de Redes Sociais

### Atualizar Links das Redes Sociais
1. Acesse o banco de dados Supabase diretamente
2. Vá para a tabela **"social_links"**
3. Edite os URLs conforme necessário:
   - Instagram: `https://instagram.com/seu-perfil`
   - Facebook: `https://facebook.com/sua-pagina`
   - LinkedIn: `https://linkedin.com/company/sua-empresa`
   - WhatsApp: `https://wa.me/5582999999999`

### Ativar/Desativar Redes Sociais
- Use o campo **"active"** para mostrar/ocultar links
- Use **"order_index"** para definir a ordem de exibição

---

## 📊 Dashboard e Estatísticas

### Visualizar Estatísticas
O dashboard mostra:
- **Total de Posts**: Publicados e rascunhos
- **Itens da Galeria**: Fotos e vídeos
- **Perguntas FAQ**: Ativas no sistema
- **Posts Publicados**: Apenas os públicos

### Filtros e Buscas
- Use os filtros para encontrar conteúdo específico
- A busca funciona em títulos e conteúdo
- Ordene por data, título ou status

---

## 🔧 Configurações Avançadas

### Backup do Conteúdo
1. Acesse o painel do Supabase
2. Vá em "Settings" > "Database"
3. Faça backup regular das tabelas:
   - `blog_posts`
   - `blog_categories`
   - `gallery_items`
   - `faqs`
   - `social_links`

### Gerenciar Usuários Admin
1. No Supabase, vá em "Authentication"
2. Adicione novos usuários admin
3. Configure permissões adequadas

---

## 📱 Responsividade e Mobile

### Verificar em Dispositivos Móveis
- Sempre teste o conteúdo em diferentes tamanhos de tela
- Imagens devem ser otimizadas para carregamento rápido
- Textos devem ser legíveis em telas pequenas

### Otimização de Imagens
- Use imagens em formato WebP quando possível
- Mantenha tamanhos razoáveis (máx. 1MB por imagem)
- Use URLs de CDN para melhor performance

---

## 🆘 Solução de Problemas

### Problemas Comuns

**Não consigo fazer login:**
- Verifique email e senha
- Confirme se o usuário está ativo no Supabase
- Limpe cache do navegador

**Imagens não aparecem:**
- Verifique se a URL está correta
- Teste a URL em uma nova aba
- Confirme se a imagem é pública

**Conteúdo não salva:**
- Verifique conexão com internet
- Confirme se todos os campos obrigatórios estão preenchidos
- Tente recarregar a página

### Suporte Técnico
Para problemas técnicos:
1. Verifique os logs no console do navegador (F12)
2. Acesse o painel do Supabase para verificar dados
3. Consulte a documentação do Supabase

---

## 📈 Melhores Práticas

### Para o Blog
- Publique conteúdo regularmente
- Use imagens atrativas
- Escreva títulos chamativos
- Categorize adequadamente

### Para a Galeria
- Sempre inclua fotos "antes" e "depois"
- Use descrições detalhadas
- Mantenha qualidade das imagens
- Atualize regularmente com novos projetos

### Para o FAQ
- Mantenha respostas claras e objetivas
- Atualize conforme surgem novas dúvidas
- Organize por categorias lógicas
- Revise periodicamente

---

**Lembre-se**: O site foi desenvolvido para ser fácil de usar. Em caso de dúvidas, consulte este manual ou entre em contato com o suporte técnico.

