import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { supabase, BlogPost, BlogCategory } from '@/lib/supabase';

interface BlogSectionProps {
  featured?: boolean;
  limit?: number;
  showTitle?: boolean;
}

export default function BlogSection({ featured = false, limit = 6, showTitle = true }: BlogSectionProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogData();
  }, [featured, limit]);

  const fetchBlogData = async () => {
    try {
      // Buscar posts
      let postsQuery = supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (limit) {
        postsQuery = postsQuery.limit(limit);
      }

      const { data: posts, error: postsError } = await postsQuery;

      if (postsError) {
        console.error('Error fetching blog posts:', postsError);
        return;
      }

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      setBlogPosts(posts || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: number | undefined) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="text-center mb-16">
              <div className="h-8 bg-slate-200 animate-pulse rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-slate-200 animate-pulse rounded w-96 mx-auto"></div>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Blog & Notícias
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Fique por dentro das últimas novidades e dicas sobre organização de cabeamento
              </p>
            </div>
          )}
          
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Em breve</h3>
            <p className="text-slate-600">Nosso blog estará disponível em breve com conteúdo educativo e novidades.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Blog & Notícias
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Fique por dentro das últimas novidades e dicas sobre organização de cabeamento
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.featured_image || '/api/placeholder/400/300'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {post.category_id && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <Tag className="w-3 h-3" />
                      <span>{getCategoryName(post.category_id)}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {post.title}
                </h3>

                <p className="text-slate-600 mb-4 leading-relaxed line-clamp-3">
                  {post.excerpt || truncateText(post.content.replace(/<[^>]*>/g, ''), 150)}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200"
                >
                  <span>Ler mais</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {blogPosts.length > 0 && (
          <div className="text-center mt-12">
            <a
              href="/blog"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              <span>Ver todos os posts</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

