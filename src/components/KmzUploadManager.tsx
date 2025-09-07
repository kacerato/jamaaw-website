import React, { useState, useRef } from 'react';
import { Upload, FileText, MapPin, Trash2, Download } from 'lucide-react';
import { createKmzFile, getKmzFiles } from '../lib/api';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface KmzFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  coordinates?: any;
  uploaded_by?: number;
  uploaded_at: string;
}

export function KmzUploadManager() {
  const { user } = useGoogleAuth();
  const [files, setFiles] = useState<KmzFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const kmzFiles = await getKmzFiles();
    setFiles(kmzFiles);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    Array.from(selectedFiles).forEach(file => {
      if (file.name.toLowerCase().endsWith('.kmz') || file.name.toLowerCase().endsWith('.kml')) {
        uploadFile(file);
      } else {
        alert('Por favor, selecione apenas arquivos KMZ ou KML.');
      }
    });
  };

  const uploadFile = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const coordinates = await processKmzFile(arrayBuffer, file.name);

      // Salvar no banco de dados
      const kmzFile = await createKmzFile({
        filename: `${Date.now()}_${file.name}`,
        original_name: file.name,
        file_path: `/uploads/${Date.now()}_${file.name}`,
        coordinates: coordinates,
        uploaded_by: parseInt(user.id)
      });

      if (kmzFile) {
        await loadFiles();
        alert('Arquivo KMZ carregado com sucesso!');
      } else {
        alert('Erro ao carregar arquivo KMZ.');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao processar arquivo KMZ.');
    } finally {
      setUploading(false);
    }
  };

  const processKmzFile = async (arrayBuffer: ArrayBuffer, filename: string): Promise<any> => {
    try {
      // Simular processamento de coordenadas
      // Em uma implementação real, você processaria o arquivo KMZ/KML aqui
      const coordinates = {
        points: [],
        processed_at: new Date().toISOString(),
        filename: filename
      };
      
      return coordinates;
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw error;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            Arraste arquivos KMZ/KML aqui
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ou{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={uploading}
            >
              clique para selecionar
            </button>
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".kmz,.kml"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Processando arquivo...</span>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Arquivos KMZ Carregados
          </h3>
          
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Nenhum arquivo KMZ carregado ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <MapPin className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.original_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Carregado em {formatDate(file.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Implementar download
                        alert('Funcionalidade de download em desenvolvimento');
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Baixar arquivo"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este arquivo?')) {
                          // Implementar exclusão
                          alert('Funcionalidade de exclusão em desenvolvimento');
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

