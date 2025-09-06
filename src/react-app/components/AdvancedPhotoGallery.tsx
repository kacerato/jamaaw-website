import { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Trash2, Plus, Download, Share2, Grid, List, Search } from 'lucide-react';

interface Photo {
  id: number;
  photo_url: string;
  photo_type: 'before' | 'during' | 'after' | 'work' | 'team' | 'equipment';
  description?: string | null;
  created_at: string;
  uploaded_by?: string | null;
  tags?: string[] | null;
}

interface AdvancedPhotoGalleryProps {
  streetId: number;
  streetName: string;
  photos: Photo[];
  isAdmin?: boolean;
  onPhotosChange?: () => void;
}

const photoTypeLabels = {
  before: 'Antes',
  during: 'Durante',
  after: 'Depois',
  work: 'Trabalho',
  team: 'Equipe',
  equipment: 'Equipamentos'
};

const photoTypeColors = {
  before: 'bg-red-100 text-red-800 border-red-200',
  during: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  after: 'bg-green-100 text-green-800 border-green-200',
  work: 'bg-blue-100 text-blue-800 border-blue-200',
  team: 'bg-purple-100 text-purple-800 border-purple-200',
  equipment: 'bg-orange-100 text-orange-800 border-orange-200'
};

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'oldest' | 'type';

export default function AdvancedPhotoGallery({ 
  streetId, 
  streetName, 
  photos, 
  isAdmin = false, 
  onPhotosChange 
}: AdvancedPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    type: 'work' as Photo['photo_type'],
    description: '',
    tags: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort photos
  const filteredAndSortedPhotos = photos
    .filter(photo => {
      const matchesType = filterType === 'all' || photo.photo_type === filterType;
      const matchesSearch = !searchTerm || 
        photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'type':
          return a.photo_type.localeCompare(b.photo_type);
        default:
          return 0;
      }
    });

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of Array.from(files)) {
        // Validate file on client side
        if (file.size > 10 * 1024 * 1024) {
          alert(`Arquivo ${file.name} é muito grande. Máximo 10MB permitido.`);
          errorCount++;
          continue;
        }
        
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          alert(`Arquivo ${file.name} não é um formato válido. Use JPEG, PNG ou WebP.`);
          errorCount++;
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('street_id', streetId.toString());
        formData.append('photo_type', uploadData.type);
        formData.append('description', uploadData.description);
        formData.append('tags', uploadData.tags);

        try {
          const response = await fetch('/api/admin/photos', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (response.ok) {
            successCount++;
          } else {
            const errorData = await response.json();
            console.error('Error uploading photo:', errorData.error);
            errorCount++;
          }
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        alert(`${successCount} foto(s) enviada(s) com sucesso!`);
        setShowUploadForm(false);
        setUploadData({ type: 'work', description: '', tags: '' });
        onPhotosChange?.();
      }
      
      if (errorCount > 0) {
        alert(`${errorCount} foto(s) falharam no upload. Verifique os logs para detalhes.`);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Erro ao enviar fotos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Foto excluída com sucesso!');
        onPhotosChange?.();
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir foto: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Erro ao excluir foto. Tente novamente.');
    }
  };

  

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.photo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${streetName}_${photo.photo_type}_${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const sharePhoto = async (photo: Photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${streetName} - ${photoTypeLabels[photo.photo_type]}`,
          text: photo.description || `Foto do trabalho de organização de cabeamento`,
          url: photo.photo_url,
        });
      } catch (error) {
        console.log('Error sharing photo:', error);
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(photo.photo_url);
      alert('Link da foto copiado para a área de transferência!');
    }
  };

  const getPhotoStats = () => {
    const stats = photos.reduce((acc, photo) => {
      acc[photo.photo_type] = (acc[photo.photo_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const photoStats = getPhotoStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Galeria de Fotos</h3>
          <p className="text-sm text-slate-600">{streetName} • {photos.length} fotos</p>
        </div>
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Fotos</span>
            </button>
          </div>
        )}
      </div>

      {/* Photo Statistics */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.entries(photoTypeLabels).map(([type, label]) => (
          <div key={type} className="text-center">
            <div className={`text-lg font-bold ${photoTypeColors[type as keyof typeof photoTypeColors].split(' ')[1]}`}>
              {photoStats[type] || 0}
            </div>
            <div className="text-xs text-slate-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fotos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(photoTypeLabels).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="type">Por tipo</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filteredAndSortedPhotos.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg font-medium">
            {photos.length === 0 ? 'Nenhuma foto disponível' : 'Nenhuma foto encontrada'}
          </p>
          {isAdmin && photos.length === 0 && (
            <p className="text-sm text-slate-400 mt-2">Adicione fotos do trabalho realizado</p>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
          : 'space-y-4'
        }>
          {filteredAndSortedPhotos.map((photo) => (
            viewMode === 'grid' ? (
              <div
                key={photo.id}
                className="relative group cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.photo_url}
                    alt={photo.description || 'Foto do trabalho'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute top-2 left-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${photoTypeColors[photo.photo_type]}`}>
                    {photoTypeLabels[photo.photo_type]}
                  </span>
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button className="bg-white text-slate-700 p-2 rounded-full hover:bg-slate-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(photo);
                      }}
                      className="bg-white text-slate-700 p-2 rounded-full hover:bg-slate-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {photo.description && (
                  <div className="p-2">
                    <p className="text-xs text-slate-600 truncate">{photo.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div key={photo.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={photo.photo_url}
                    alt={photo.description || 'Foto do trabalho'}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${photoTypeColors[photo.photo_type]}`}>
                      {photoTypeLabels[photo.photo_type]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {photo.description && (
                    <p className="text-sm text-slate-700 truncate">{photo.description}</p>
                  )}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {photo.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-2 text-slate-600 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadPhoto(photo)}
                    className="p-2 text-slate-600 hover:text-green-600"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sharePhoto(photo)}
                    className="p-2 text-slate-600 hover:text-purple-600"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 text-slate-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${photoTypeColors[selectedPhoto.photo_type]}`}>
                  {photoTypeLabels[selectedPhoto.photo_type]}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR')}
                </span>
                {selectedPhoto.uploaded_by && (
                  <span className="text-sm text-slate-500">
                    por {selectedPhoto.uploaded_by}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadPhoto(selectedPhoto)}
                  className="p-2 text-slate-600 hover:text-green-600"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sharePhoto(selectedPhoto)}
                  className="p-2 text-slate-600 hover:text-purple-600"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.description || 'Foto do trabalho'}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              
              {selectedPhoto.description && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-700">{selectedPhoto.description}</p>
                </div>
              )}
              
              {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPhoto.tags.map(tag => (
                    <span key={tag} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Adicionar Fotos</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Foto</label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value as Photo['photo_type'] }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(photoTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a foto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="ex: poste, fios, organizacao"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Selecionar Arquivos</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Você pode selecionar múltiplas fotos</p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Enviar Fotos</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
