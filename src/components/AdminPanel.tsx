import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getKmzFiles, 
  deleteKmzFile, 
  saveKmzFile, 
  processKmzFile,
  getKmzCoordinates 
} from '../lib/kmzProcessor';
import { KmzFile, KmzCoordinate } from '../lib/database';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [kmzFiles, setKmzFiles] = useState<KmzFile[]>([]);
  const [coordinates, setCoordinates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    loadKmzFiles();
    loadCoordinates();
  }, []);

  const loadKmzFiles = async () => {
    const files = await getKmzFiles();
    setKmzFiles(files);
  };

  const loadCoordinates = async () => {
    const coords = await getKmzCoordinates();
    setCoordinates(coords);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.kmz')) {
      setUploadStatus('Por favor, selecione um arquivo KMZ válido.');
      return;
    }

    setIsLoading(true);
    setUploadStatus('Fazendo upload do arquivo...');

    try {
      // Gerar um nome único para o arquivo
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const storagePath = `uploads/${filename}`;

      // Salvar informações do arquivo no banco de dados
      const fileId = await saveKmzFile(filename, file.name, file.size, storagePath);
      
      if (!fileId) {
        setUploadStatus('Erro ao salvar arquivo no banco de dados.');
        return;
      }

      setUploadStatus('Processando arquivo KMZ...');

      // Processar o arquivo KMZ
      const success = await processKmzFile(fileId, file);
      
      if (success) {
        setUploadStatus('Arquivo KMZ processado com sucesso!');
        await loadKmzFiles();
        await loadCoordinates();
      } else {
        setUploadStatus('Erro ao processar arquivo KMZ.');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus('Erro interno durante o upload.');
    } finally {
      setIsLoading(false);
      // Limpar status após 3 segundos
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    const success = await deleteKmzFile(fileId);
    if (success) {
      await loadKmzFiles();
      await loadCoordinates();
    } else {
      alert('Erro ao excluir arquivo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
              <p className="text-gray-600">Bem-vindo, {user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload de Arquivos KMZ */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Upload de Arquivo KMZ
              </h3>
              <div className="mt-2">
                <input
                  type="file"
                  accept=".kmz"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadStatus && (
                  <p className={`mt-2 text-sm ${uploadStatus.includes('sucesso') ? 'text-green-600' : uploadStatus.includes('Erro') ? 'text-red-600' : 'text-blue-600'}`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Arquivos KMZ */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Arquivos KMZ ({kmzFiles.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome do Arquivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tamanho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Upload
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kmzFiles.map((file) => (
                      <tr key={file.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {file.original_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(file.file_size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            file.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {file.processed ? 'Processado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {kmzFiles.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhum arquivo KMZ encontrado.</p>
                )}
              </div>
            </div>
          </div>

          {/* Coordenadas Extraídas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Coordenadas Extraídas ({coordinates.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latitude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Longitude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coordinates.map((coord, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {coord.name || 'Sem nome'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coord.latitude.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coord.longitude.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {coord.description || 'Sem descrição'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {coordinates.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Nenhuma coordenada encontrada.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

