import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { processKmzFile } from '@/lib/kmzProcessor';

interface KmzUploaderProps {
  onUploadSuccess?: (fileName: string) => void;
  onClose?: () => void;
}

export default function KmzUploader({ onUploadSuccess, onClose }: KmzUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Verificar se é um arquivo KMZ
      if (!selectedFile.name.toLowerCase().endsWith('.kmz')) {
        setError('Por favor, selecione apenas arquivos KMZ');
        return;
      }
      
      // Verificar tamanho do arquivo (máximo 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile) {
      if (!droppedFile.name.toLowerCase().endsWith('.kmz')) {
        setError('Por favor, selecione apenas arquivos KMZ');
        return;
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload para o Supabase Storage
      const fileName = `kmz_${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('kmz-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Salvar informações do arquivo na tabela kmz_files
      const { data: kmzFileData, error: dbError } = await supabase
        .from("kmz_files")
        .insert({
          filename: fileName,
          original_name: file.name,
          file_size: file.size,
          storage_path: data.path,
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Processar o arquivo KMZ e salvar as coordenadas
      const processSuccess = await processKmzFile(kmzFileData.id, file);

      if (!processSuccess) {
        throw new Error("Erro ao processar o arquivo KMZ.");
      }

      setSuccess(`Arquivo ${file.name} enviado e processado com sucesso!`);
      onUploadSuccess?.(fileName);
      
      // Limpar o formulário após 2 segundos
      setTimeout(() => {
        setFile(null);
        setSuccess(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error: any) {
      console.error('Erro no upload:', error);
      setError(error.message || 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900">Upload de Arquivo KMZ</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Área de upload */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            file 
              ? 'border-green-300 bg-green-50' 
              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <FileText className="w-12 h-12 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remover arquivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Upload className="w-12 h-12 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 mb-1">
                  Arraste um arquivo KMZ aqui
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  ou clique para selecionar
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kmz"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Selecionar Arquivo
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Máximo 10MB • Apenas arquivos .kmz
              </p>
            </div>
          )}
        </div>

        {/* Mensagens de erro e sucesso */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={uploadFile}
            disabled={!file || uploading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Fazer Upload</span>
              </>
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> O arquivo KMZ será processado automaticamente e as coordenadas serão exibidas no mapa interativo.
          </p>
        </div>
      </div>
    </div>
  );
}

