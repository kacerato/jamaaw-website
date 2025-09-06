import { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight, MapPin, Calendar, Eye } from 'lucide-react';
import { supabase, GalleryItem } from '@/lib/supabase';

interface BeforeAfterGalleryProps {
  featured?: boolean;
  limit?: number;
}

export default function BeforeAfterGallery({ featured = false, limit }: BeforeAfterGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGalleryItems();
  }, [featured, limit]);

  const fetchGalleryItems = async () => {
    try {
      let query = supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (featured) {
        query = query.eq('featured', true);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching gallery items:', error);
        return;
      }

      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item: GalleryItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedItem) {
      const images = [selectedItem.before_image, selectedItem.after_image].filter(Boolean);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedItem) {
      const images = [selectedItem.before_image, selectedItem.after_image].filter(Boolean);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getCurrentImage = () => {
    if (!selectedItem) return '';
    const images = [selectedItem.before_image, selectedItem.after_image].filter(Boolean);
    return images[currentImageIndex] || '';
  };

  const getImageLabel = () => {
    if (!selectedItem) return '';
    const images = [selectedItem.before_image, selectedItem.after_image].filter(Boolean);
    if (images.length === 2) {
      return currentImageIndex === 0 ? 'ANTES' : 'DEPOIS';
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Transformações Reais
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Veja como nosso trabalho profissional transforma a infraestrutura de telecomunicações
            </p>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Em breve</h3>
              <p className="text-slate-600">Nossa galeria de transformações estará disponível em breve.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
                  onClick={() => openModal(item)}
                >
                  {item.type === 'video' && item.video_url ? (
                    <div className="relative h-64 bg-slate-900 flex items-center justify-center">
                      <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={item.before_image || item.after_image || '/api/placeholder/400/300'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                      
                      {item.before_image && item.after_image && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Antes & Depois
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm opacity-90 mb-2 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm opacity-75">
                      {item.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                      )}
                      {item.project_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(item.project_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-white rounded-2xl overflow-hidden">
              {selectedItem.type === 'video' && selectedItem.video_url ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedItem.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedItem.title}
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={getCurrentImage()}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[60vh] object-contain bg-slate-100"
                  />
                  
                  {getImageLabel() && (
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold">
                      {getImageLabel()}
                    </div>
                  )}

                  {selectedItem.before_image && selectedItem.after_image && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-200"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {selectedItem.title}
                </h3>
                
                {selectedItem.description && (
                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-4">
                  {selectedItem.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedItem.location}</span>
                    </div>
                  )}
                  {selectedItem.project_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedItem.project_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

