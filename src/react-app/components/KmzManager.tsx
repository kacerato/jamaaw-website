import { useState, useEffect } from 'react';
import { FileText, Trash2, CheckCircle, Clock, AlertCircle, Eye, Upload, MapPin, RefreshCw } from 'lucide-react';
import { getKmzFiles, deleteKmzFile, getKmzCoordinatesByFileId, KmzFile, KmzCoordinate } from '@/lib/kmzProcessor';
import KmzUploader from './KmzUploader';

interface KmzManagerProps {
  onUpdate?: () => void;
}

export default function KmzManager({ onUpdate }: KmzManagerProps) {
  const [kmzFiles, setKmzFiles] = useState<KmzFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState<KmzFile | null>(null);
  const [fileCoordinates, setFileCoordinates] = useState<KmzCoordinate[]>([]);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadKmzFiles();
  }, []);

  const loadKmzFiles = async () => {
    setLoading(true);
    try {
      const files = await getKmzFiles();
      setKmzFiles(files);
    } catch (error) {
      console.error('Erro ao carregar arquivos KMZ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadKmzFiles();
    onUpdate?.();
    setRefreshing(false);
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo KMZ? Esta ação não pode ser desfeita.')) return;

    try {
      const success = await deleteKmzFile(fileId);
      if (success) {
        await loadKmzFiles();
        onUpdate?.();
      } else {
        alert('Erro ao excluir arquivo');
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      alert('Erro ao excluir arquivo');
    }
  };

  const handleViewCoordinates = async (file: KmzFile) => {
    try {
      const coordinates = await getKmzCoordinatesByFileId(file.id);
      setSelectedFile(file);
      setFileCoordinates(coordinates);
      setShowCoordinates(true);
    } catch (error) {
      console.error('Erro ao carregar coordenadas:', error);
      alert('Erro ao carregar coordenadas');
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploader(false);
    await loadKmzFiles();
    onUpdate?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando arquivos KMZ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Arquivos KMZ</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Atualizar</span>
            </button>
            <button
              onClick={() => setShowUploader(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload KMZ</span>
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Arquivos</p>
                <p className="text-2xl font-bold text-blue-900">{kmzFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Processados</p>
                <p className="text-2xl font-bold text-green-900">
                  {kmzFiles.filter(f => f.processed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {kmzFiles.filter(f => !f.processed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Tamanho Total</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatFileSize(kmzFiles.reduce((acc, f) => acc + f.file_size, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de arquivos */}
      {kmzFiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum arquivo KMZ encontrado</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Faça upload de arquivos KMZ para visualizar as coordenadas no mapa interativo do site.
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Fazer Primeiro Upload</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Arquivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tamanho
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Upload
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {kmzFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{file.original_name}</div>
                          <div className="text-sm text-slate-500">{file.filename}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-slate-700 font-medium">
                        {formatFileSize(file.file_size)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {file.processed ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Processado
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pendente
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(file.uploaded_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2 justify-end">
                        {file.processed && (
                          <button
                            onClick={() => handleViewCoordinates(file)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver coordenadas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir arquivo"
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
      )}

      {/* Modal de Upload */}
      {showUploader && (
        <KmzUploader
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Modal de Coordenadas */}
      {showCoordinates && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Coordenadas Extraídas
                </h3>
                <p className="text-slate-600">{selectedFile.original_name}</p>
              </div>
              <button
                onClick={() => setShowCoordinates(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-96">
              {fileCoordinates.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhuma coordenada encontrada neste arquivo</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {fileCoordinates.map((coord, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-slate-900">
                          {coord.name || `Ponto ${index + 1}`}
                        </h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          KMZ
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 w-16">Lat:</span>
                          <span className="font-mono text-slate-900">{coord.latitude.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 w-16">Lng:</span>
                          <span className="font-mono text-slate-900">{coord.longitude.toFixed(6)}</span>
                        </div>
                        {coord.description && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-slate-600 text-sm">{coord.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {fileCoordinates.length > 0 && (
                  <span>{fileCoordinates.length} coordenada(s) encontrada(s)</span>
                )}
              </div>
              <button
                onClick={() => setShowCoordinates(false)}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

