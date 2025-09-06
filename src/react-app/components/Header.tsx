import { Cable, MapPin, Menu, X, User, LogOut } from 'lucide-react';
import MaceioFlag from '@/react-app/components/MaceioFlag';
import NotificationSystem from '@/react-app/components/NotificationSystem';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@/react-app/components/AuthProvider';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    window.location.href = '/login';
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Cable className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
                JAMAAW
              </h1>
              <p className="text-xs text-slate-600">Organização de Cabeamento</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Início
            </Link>
            <Link
              to="/mapa"
              className={`text-sm font-medium transition-colors ${
                isActive('/mapa') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Mapa de Ruas
            </Link>
            <Link
              to="/sugestoes"
              className={`text-sm font-medium transition-colors ${
                isActive('/sugestoes') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
              }`}
            >
              Sugerir Rua
            </Link>
            {user && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <MaceioFlag />
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>Maceió - AL</span>
              </div>
            </div>
            
            {/* Notification System */}
            <NotificationSystem />
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-slate-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Início
            </Link>
            <Link
              to="/mapa"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/mapa') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Mapa de Ruas
            </Link>
            <Link
              to="/sugestoes"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/sugestoes') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Sugerir Rua
            </Link>
            {user && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Admin
              </Link>
            )}
            
            <div className="border-t border-slate-200 pt-2 mt-2">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 py-2 px-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
