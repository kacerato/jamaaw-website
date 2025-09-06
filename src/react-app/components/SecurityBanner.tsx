import { useState } from 'react';
import { Shield, X, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

interface SecurityBannerProps {
  className?: string;
}

export default function SecurityBanner({ className = '' }: SecurityBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  const securityFeatures = [
    { icon: Lock, title: 'Autenticação Segura', description: 'Login através do Google OAuth 2.0' },
    { icon: Shield, title: 'Headers de Segurança', description: 'Proteção XSS, CSRF e Clickjacking' },
    { icon: CheckCircle, title: 'Rate Limiting', description: 'Proteção contra ataques automatizados' },
    { icon: AlertTriangle, title: 'Validação de Arquivos', description: 'Verificação rigorosa de uploads' }
  ];

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Sistema Seguro</h3>
            <p className="text-xs text-slate-600">
              {showDetails ? 'Recursos de segurança implementados' : 'Proteção avançada ativa'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
          >
            {showDetails ? 'Ocultar' : 'Detalhes'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg">
              <feature.icon className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-medium text-slate-900">{feature.title}</h4>
                <p className="text-xs text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
