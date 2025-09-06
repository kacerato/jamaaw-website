import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../components/AuthProvider';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processar o callback de autenticação
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          setError('Erro na autenticação. Tente novamente.');
          setProcessing(false);
          return;
        }

        if (data.session) {
          // Aguardar um pouco para o AuthProvider processar
          setTimeout(() => {
            setProcessing(false);
          }, 2000);
        } else {
          setError('Sessão não encontrada. Tente fazer login novamente.');
          setProcessing(false);
        }
      } catch (error) {
        console.error('Erro no callback:', error);
        setError('Erro inesperado. Tente novamente.');
        setProcessing(false);
      }
    };

    handleAuthCallback();
  }, []);

  useEffect(() => {
    if (!processing && !loading) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/login?error=unauthorized', { replace: true });
      }
    }
  }, [processing, loading, isAdmin, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro na Autenticação</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-800">
            {processing ? 'Verificando credenciais...' : 'Redirecionando...'}
          </span>
        </div>
      </div>
    </div>
  );
}
