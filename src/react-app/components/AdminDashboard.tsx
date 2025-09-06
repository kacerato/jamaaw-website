import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Image,
  Tag,
  MessageSquare,
  Globe,
  Map,
  LogOut
} from 'lucide-react';
import { supabase, BlogPost, BlogCategory, GalleryItem, FAQ, KmzFile } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import KmzManager from './KmzManager';

type TabType = 'overview' | 'posts' | 'gallery' | 'faq' | 'categories' | 'kmz' | 'settings';

export default function AdminDashboard() {
  const { adminUser, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [kmzFiles, setKmzFiles] = useState<KmzFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, categoriesRes, galleryRes, faqsRes, kmzRes] = await Promise.all([
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
        supabase.from('faqs').select('*').order('order_index'),
        supabase.from('kmz_files').select('*').order('uploaded_at', { ascending: false })
      ]);

      setBlogPosts(postsRes.data || []);
      setCategories(categoriesRes.data || []);
      setGalleryItems(galleryRes.data || []);
      setFaqs(faqsRes.data || []);
      setKmzFiles(kmzRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      if (editingItem?.id) {
        // Update
        const { error } = await supabase
          .from(type)
          .update(data)
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from(type)
          .insert([data]);
        
        if (error) throw error;
      }
      
      setShowModal(false);
      setEditingItem(null);
      fetchAllData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erro ao salvar. Tente novamente.');
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Erro ao excluir. Tente novamente.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'kmz', label: 'Arquivos KMZ', icon: Map },
    { id: 'posts', label: 'Posts do Blog', icon: FileText },
    { id: 'gallery', label: 'Galeria', icon: Image },
    { id: 'faq', label: 'FAQ', icon: MessageSquare },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Acesso Negado
          </h2>
          <p className="text-slate-600 text-center mb-6">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Voltar ao Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Painel Administrativo JAMAAW
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="flex items-center space-x-3">
                  <img 
                    src={adminUser.avatar_url || `https://github.com/${adminUser.github_username}.png`}
                    alt={adminUser.name || adminUser.github_username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {adminUser.name || adminUser.github_username}
                    </p>
                    <p className="text-xs text-slate-500">Administrador</p>
                  </div>
                </div>
              )}
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <OverviewTab 
                blogPosts={blogPosts}
                galleryItems={galleryItems}
                faqs={faqs}
                kmzFiles={kmzFiles}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'kmz' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Arquivos KMZ</h2>
                </div>
                <KmzManager onUpdate={fetchAllData} />
              </div>
            )}

            {activeTab === 'posts' && (
              <PostsTab
                posts={blogPosts}
                categories={categories}
                onEdit={(post: any) => {
                  setEditingItem(post);
                  setEditingType('blog_posts');
                  setShowModal(true);
                }}
                onDelete={(id: any) => handleDelete('blog_posts', id)}
                onNew={() => {
                  setEditingItem(null);
                  setEditingType('blog_posts');
                  setShowModal(true);
                }}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'gallery' && (
              <GalleryTab
                items={galleryItems}
                onEdit={(item: any) => {
                  setEditingItem(item);
                  setEditingType('gallery_items');
                  setShowModal(true);
                }}
                onDelete={(id: any) => handleDelete('gallery_items', id)}
                onNew={() => {
                  setEditingItem(null);
                  setEditingType('gallery_items');
                  setShowModal(true);
                }}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'faq' && (
              <FAQTab
                faqs={faqs}
                onEdit={(faq: any) => {
                  setEditingItem(faq);
                  setEditingType('faqs');
                  setShowModal(true);
                }}
                onDelete={(id: any) => handleDelete('faqs', id)}
                onNew={() => {
                  setEditingItem(null);
                  setEditingType('faqs');
                  setShowModal(true);
                }}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                onEdit={(category: any) => {
                  setEditingItem(category);
                  setEditingType('blog_categories');
                  setShowModal(true);
                }}
                onDelete={(id: any) => handleDelete('blog_categories', id)}
                onNew={() => {
                  setEditingItem(null);
                  setEditingType('blog_categories');
                  setShowModal(true);
                }}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab adminUser={adminUser} />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <EditModal
          type={editingType}
          item={editingItem}
          categories={categories}
          onSave={(data: any) => handleSave(editingType, data)}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setEditingType('');
          }}
        />
      )}
    </div>
  );
}

// Componentes auxiliares
function OverviewTab({ blogPosts, galleryItems, faqs, kmzFiles, isLoading }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  const stats = [
    { label: 'Arquivos KMZ', value: kmzFiles.length, icon: Map, color: 'blue' },
    { label: 'Posts do Blog', value: blogPosts.length, icon: FileText, color: 'green' },
    { label: 'Itens da Galeria', value: galleryItems.length, icon: Image, color: 'purple' },
    { label: 'Perguntas FAQ', value: faqs.length, icon: MessageSquare, color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Arquivos KMZ Recentes</h3>
          <div className="space-y-3">
            {kmzFiles.slice(0, 5).map((file: any) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900">{file.original_name}</h4>
                  <p className="text-sm text-slate-600">
                    {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  file.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {file.processed ? 'Processado' : 'Pendente'}
                </span>
              </div>
            ))}
            {kmzFiles.length === 0 && (
              <p className="text-slate-500 text-center py-4">Nenhum arquivo KMZ encontrado</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Posts Recentes</h3>
          <div className="space-y-3">
            {blogPosts.slice(0, 5).map((post: BlogPost) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-900">{post.title}</h4>
                  <p className="text-sm text-slate-600">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.published ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            ))}
            {blogPosts.length === 0 && (
              <p className="text-slate-500 text-center py-4">Nenhum post encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostsTab({ posts, categories, onEdit, onDelete, onNew, isLoading }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Posts do Blog</h2>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Post</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Título</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Categoria</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Status</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Data</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {posts.map((post: BlogPost) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-medium text-slate-900">{post.title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-1">{post.excerpt}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">
                      {categories.find((c: any) => c.id === post.category_id)?.name || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(post)}
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(post.id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GalleryTab({ items, onEdit, onDelete, onNew, isLoading }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Galeria</h2>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: GalleryItem) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
            <div className="aspect-video bg-slate-100 relative">
              {item.before_image && (
                <img
                  src={item.before_image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => onEdit(item)}
                  className="bg-white/80 text-slate-700 p-1 rounded hover:bg-white transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="bg-white/80 text-red-600 p-1 rounded hover:bg-white transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-slate-900 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.type}</span>
                {item.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Destaque
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQTab({ faqs, onEdit, onDelete, onNew, isLoading }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Pergunta</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="divide-y divide-slate-200">
          {faqs.map((faq: FAQ) => (
            <div key={faq.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-2">{faq.question}</h4>
                  <p className="text-slate-600 line-clamp-3">{faq.answer}</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
                    <span>Categoria: {faq.category || 'Geral'}</span>
                    <span>Ordem: {faq.order_index}</span>
                    <span className={faq.active ? 'text-green-600' : 'text-red-600'}>
                      {faq.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(faq)}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(faq.id)}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesTab({ categories, onEdit, onDelete, onNew, isLoading }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Categorias</h2>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Nome</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Slug</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Descrição</th>
                <th className="text-left px-6 py-4 font-medium text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((category: BlogCategory) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{category.name}</td>
                  <td className="px-6 py-4 text-slate-600">{category.slug}</td>
                  <td className="px-6 py-4 text-slate-600">{category.description || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(category.id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditModal({ type, item, categories, onSave, onClose }: any) {
  const [formData, setFormData] = useState(item || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {item ? 'Editar' : 'Novo'} {type === 'posts' ? 'Post' : type === 'gallery' ? 'Item da Galeria' : type === 'faq' ? 'FAQ' : 'Categoria'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {type === 'posts' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resumo</label>
                <textarea
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Conteúdo</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem de Destaque (URL)</label>
                <input
                  type="url"
                  value={formData.featured_image || ''}
                  onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published || false}
                  onChange={(e) => setFormData({...formData, published: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="published" className="text-sm font-medium text-slate-700">
                  Publicar post
                </label>
              </div>
            </>
          )}

          {type === 'gallery' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <select
                  value={formData.type || 'before_after'}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="before_after">Antes e Depois</option>
                  <option value="video">Vídeo</option>
                  <option value="image">Imagem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem Antes (URL)</label>
                <input
                  type="url"
                  value={formData.before_image || ''}
                  onChange={(e) => setFormData({...formData, before_image: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem Depois (URL)</label>
                <input
                  type="url"
                  value={formData.after_image || ''}
                  onChange={(e) => setFormData({...formData, after_image: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Localização</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                  Item em destaque
                </label>
              </div>
            </>
          )}

          {type === 'faq' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pergunta</label>
                <input
                  type="text"
                  value={formData.question || ''}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resposta</label>
                <textarea
                  value={formData.answer || ''}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ordem</label>
                <input
                  type="number"
                  value={formData.order_index || 0}
                  onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active !== false}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm font-medium text-slate-700">
                  Pergunta ativa
                </label>
              </div>
            </>
          )}

          {type === 'categories' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



// Componente de Configurações
function SettingsTab({ adminUser }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações do Usuário */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações do Administrador</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img 
                src={adminUser?.avatar_url || `https://github.com/${adminUser?.github_username}.png`}
                alt={adminUser?.name || adminUser?.github_username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h4 className="font-medium text-slate-900">
                  {adminUser?.name || adminUser?.github_username}
                </h4>
                <p className="text-slate-600">{adminUser?.email}</p>
                <p className="text-sm text-slate-500">@{adminUser?.github_username}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">GitHub ID</p>
                  <p className="font-medium">{adminUser?.github_id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Último Login</p>
                  <p className="font-medium">
                    {adminUser?.last_login 
                      ? new Date(adminUser.last_login).toLocaleDateString('pt-BR')
                      : 'Primeiro acesso'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configurações do Sistema */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurações do Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Autenticação GitHub</h4>
                <p className="text-sm text-slate-600">Sistema de login via GitHub OAuth</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Ativo
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Upload de KMZ</h4>
                <p className="text-sm text-slate-600">Sistema de upload e processamento de arquivos KMZ</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Ativo
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-900">Mapa Interativo</h4>
                <p className="text-sm text-slate-600">Integração com Leaflet para exibição de coordenadas</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Ativo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Técnicas</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Banco de Dados</h4>
            <p className="text-slate-600">Supabase PostgreSQL</p>
            <p className="text-sm text-slate-500">Autenticação e armazenamento</p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Storage</h4>
            <p className="text-slate-600">Supabase Storage</p>
            <p className="text-sm text-slate-500">Arquivos KMZ e imagens</p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Frontend</h4>
            <p className="text-slate-600">React + TypeScript</p>
            <p className="text-sm text-slate-500">Interface administrativa</p>
          </div>
        </div>
      </div>

      {/* Links Úteis */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Links Úteis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="/" 
            target="_blank"
            className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-5 h-5 text-slate-600" />
            <div>
              <h4 className="font-medium text-slate-900">Site Principal</h4>
              <p className="text-sm text-slate-600">Visualizar site público</p>
            </div>
          </a>
          
          <a 
            href="/mapa" 
            target="_blank"
            className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Map className="w-5 h-5 text-slate-600" />
            <div>
              <h4 className="font-medium text-slate-900">Mapa Interativo</h4>
              <p className="text-sm text-slate-600">Visualizar mapa com coordenadas KMZ</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

