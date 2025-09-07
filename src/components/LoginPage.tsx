import React, { useState } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { user } = useGoogleAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const handleLoginSuccess = () => {
    setError('');
    navigate('/admin');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (user) {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">J</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Acesso Administrativo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Faça login para acessar o painel administrativo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <GoogleLoginButton 
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

