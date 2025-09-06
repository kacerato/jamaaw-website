import { useState } from 'react';
import { CreateSuggestionRequestType } from '@/shared/types';
import Header from '@/react-app/components/Header';
import { Send, CheckCircle, MapPin, MessageCircle } from 'lucide-react';

export default function SuggestionsPage() {
  const [formData, setFormData] = useState<CreateSuggestionRequestType>({
    street_name: '',
    neighborhood: '',
    description: '',
    suggested_by_name: '',
    suggested_by_email: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar sugestão');
      }

      setIsSubmitted(true);
      setFormData({
        street_name: '',
        neighborhood: '',
        description: '',
        suggested_by_name: '',
        suggested_by_email: '',
      });
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setError('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Sugestão Enviada com Sucesso!
            </h1>
            
            <p className="text-xl text-slate-600 mb-8">
              Obrigado por contribuir com a melhoria dos serviços em Maceió. 
              Nossa equipe irá analisar sua sugestão em breve.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">O que acontece agora?</h3>
                <ul className="text-sm text-blue-800 space-y-2 text-left">
                  <li>• Nossa equipe administrativa irá revisar sua sugestão</li>
                  <li>• Se aprovada, a rua será adicionada ao nosso cronograma</li>
                  <li>• Você pode acompanhar o progresso no mapa de ruas</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enviar Nova Sugestão
              </button>
              <a
                href="/mapa"
                className="bg-slate-100 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors inline-block"
              >
                Ver Mapa de Ruas
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sugerir Nova Rua
          </h1>
          <p className="text-xl text-slate-600">
            Ajude-nos a identificar ruas que precisam de organização de cabeamento em Maceió
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Formulário de Sugestão</h2>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="street_name" className="block text-sm font-medium text-slate-700 mb-2">
                      Nome da Rua *
                    </label>
                    <input
                      type="text"
                      id="street_name"
                      name="street_name"
                      value={formData.street_name}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Rua das Flores"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="neighborhood" className="block text-sm font-medium text-slate-700 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder="Ex: Centro"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                    Descrição da Situação
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Descreva o problema com os cabos nesta rua..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="suggested_by_name" className="block text-sm font-medium text-slate-700 mb-2">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      id="suggested_by_name"
                      name="suggested_by_name"
                      value={formData.suggested_by_name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="suggested_by_email" className="block text-sm font-medium text-slate-700 mb-2">
                      Seu Email
                    </label>
                    <input
                      type="email"
                      id="suggested_by_email"
                      name="suggested_by_email"
                      value={formData.suggested_by_email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="w-5 h-5" />
                        <span>Enviar Sugestão</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Por que sugerir?</h3>
              </div>
              
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ajuda a priorizar áreas com maior necessidade</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Contribui para um Maceió mais organizado</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Melhora a segurança urbana</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Facilita futuras manutenções</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Como funciona?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Você sugere</p>
                    <p className="text-sm text-blue-700">Preenche o formulário com as informações da rua</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Analisamos</p>
                    <p className="text-sm text-blue-700">Nossa equipe avalia a necessidade e prioridade</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Executamos</p>
                    <p className="text-sm text-blue-700">Se aprovada, incluímos no cronograma de trabalho</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
