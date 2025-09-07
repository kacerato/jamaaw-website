import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { createOrUpdateGoogleUser } from '../lib/googleAuth';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const { login } = useGoogleAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google) {
      // Carregar o script do Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google || !buttonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
    });
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decodificar o JWT token do Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const googleProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Criar ou atualizar usuário no banco de dados
      const user = await createOrUpdateGoogleUser(googleProfile);
      
      if (user) {
        login(user);
        onSuccess?.();
      } else {
        onError?.('Erro ao processar login');
      }
    } catch (error) {
      console.error('Erro no login Google:', error);
      onError?.('Erro no login Google');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div ref={buttonRef}></div>
      <p className="text-sm text-gray-600 text-center">
        Faça login com sua conta Google para acessar o sistema
      </p>
    </div>
  );
}

