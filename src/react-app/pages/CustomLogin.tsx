import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import GitHubLoginButton from '../components/GitHubLoginButton';

export default function CustomLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há erro na URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Acesso negado. Você não tem permissão para acessar o painel administrativo.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-medium text-slate-800">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl font-bold text-blue-900">J</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">JAMAAW</h1>
          <p className="text-blue-200">Painel Administrativo</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-600">
              Faça login com sua conta GitHub autorizada para acessar o painel administrativo.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Botão de Login GitHub */}
          <GitHubLoginButton className="w-full mb-6" />

          {/* Informações Adicionais */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Apenas usuários autorizados podem acessar este painel.
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              ← Voltar ao site
            </button>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            🔒 Conexão segura protegida por SSL
          </p>
        </div>
      </div>
    </div>
  );
}

