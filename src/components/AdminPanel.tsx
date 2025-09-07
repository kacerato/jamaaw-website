import React, { useState, useEffect } from 'react';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { KmzUploadManager } from './KmzUploadManager';

export default function AdminPanel() {
  const { user, logout } = useGoogleAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
              <p className="text-gray-600">Bem-vindo, {user?.name || user?.email}</p>
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
          <KmzUploadManager />
        </div>
      </div>
    </div>
  );
}

