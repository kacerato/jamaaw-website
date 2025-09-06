import { useState, useRef } from 'react';
import { Camera, Upload, X, Eye, Trash2, Plus } from 'lucide-react';

interface Photo {
  id: number;
  photo_url: string;
  photo_type: 'before' | 'during' | 'after' | 'work';
  description?: string;
  created_at: string;
}

interface PhotoGalleryProps {
  streetId: number;
  photos: Photo[];
  isAdmin?: boolean;
  onPhotosChange?: () => void;
}

const photoTypeLabels = {
  before: 'Antes',
  during: 'Durante',
  after: 'Depois',
  work: 'Trabalho'
};

const photoTypeColors = {
  before: 'bg-red-100 text-red-800',
  during: 'bg-yellow-100 text-yellow-800',
  after: 'bg-green-100 text-green-800',
  work: 'bg-blue-100 text-blue-800'
};

export default function PhotoGallery({ streetId, photos, isAdmin = false, onPhotosChange }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    type: 'work' as Photo['photo_type'],
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload to a cloud storage service
      // For now, we'll simulate this with a placeholder
      const formData = new FormData();
      formData.append('file', file);
      formData.append('street_id', streetId.toString());
      formData.append('photo_type', uploadData.type);
      formData.append('description', uploadData.description);

      // Simulated upload - in real app, replace with actual upload endpoint
      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setShowUploadForm(false);
        setUploadData({ type: 'work', description: '' });
        onPhotosChange?.();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
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
        onPhotosChange?.();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Galeria de Fotos</h3>
        {isAdmin && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto</span>
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhuma foto disponível</p>
          {isAdmin && (
            <p className="text-sm text-slate-400 mt-2">Adicione fotos do trabalho realizado</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
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
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${photoTypeColors[photo.photo_type]}`}>
                  {photoTypeLabels[photo.photo_type]}
                </span>
              </div>

              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button className="bg-white text-slate-700 p-2 rounded-full hover:bg-slate-100">
                    <Eye className="w-4 h-4" />
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
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${photoTypeColors[selectedPhoto.photo_type]}`}>
                  {photoTypeLabels[selectedPhoto.photo_type]}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
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
            </div>
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Adicionar Foto</h3>
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
                  <option value="before">Antes</option>
                  <option value="during">Durante</option>
                  <option value="after">Depois</option>
                  <option value="work">Trabalho</option>
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Selecionar Arquivo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                      <span>Enviar Foto</span>
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
