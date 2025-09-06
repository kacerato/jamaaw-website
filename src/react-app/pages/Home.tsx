import { useEffect, useState } from 'react';
import { Cable, CheckCircle, Shield, Phone, MapPin, TrendingUp, Users, Award, Clock } from 'lucide-react';
import Header from '@/react-app/components/Header';
import StatsCard from '@/react-app/components/StatsCard';
import Timeline from '@/react-app/components/Timeline';
import WorkProgressDashboard from '@/react-app/components/WorkProgressDashboard';
import BeforeAfterGallery from '@/react-app/components/BeforeAfterGallery';
import BlogSection from '@/react-app/components/BlogSection';
import SocialLinks from '@/react-app/components/SocialLinks';
import FAQChatbot from '@/react-app/components/FAQChatbot';
import { StreetType } from '@/shared/types';

export default function Home() {
  const [streets, setStreets] = useState<StreetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Fetch streets data
    fetchStreets();
  }, []);

  const fetchStreets = async () => {
    try {
      const response = await fetch('/api/streets');
      if (response.ok) {
        const data = await response.json();
        setStreets(data);
      }
    } catch (error) {
      console.error('Error fetching streets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = () => {
    const completed = streets.filter(s => s.status === 'completed').length;
    const inProgress = streets.filter(s => s.status === 'in_progress').length;
    const planned = streets.filter(s => s.status === 'planned').length;
    
    return { completed, inProgress, planned, total: streets.length };
  };

  const getRecentActivity = () => {
    return streets
      .slice(0, 5)
      .map(street => ({
        id: street.id,
        street: street.name,
        neighborhood: street.neighborhood || '',
        status: street.status as 'completed' | 'in_progress' | 'planned',
        date: street.updated_at,
        description: street.notes || undefined,
      }));
  };

  const stats = getStats();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-orange-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Shield className="w-4 h-4" />
                  <span>Empresa Licenciada pela Prefeitura de Maceió</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Organização Profissional de{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                    Cabeamento
                  </span>
                </h1>
                <p className="text-xl text-slate-600 mt-6 leading-relaxed">
                  Especialistas em remoção de fios inativos de internet e telefonia, 
                  agrupamento e organização de cabos. Serviços profissionais em Maceió e região.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Remoção de fios inativos de internet e telefonia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Agrupamento e organização de cabos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Espinamento profissional de fios</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Equipe licenciada e experiente</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/mapa"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
                >
                  Ver Mapa de Ruas
                </a>
                <a
                  href="/sugestoes"
                  className="flex items-center justify-center space-x-2 border-2 border-orange-500 text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  <span>Sugerir Rua</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src="https://mocha-cdn.com/01984cbb-558c-72f6-b996-f002620e6f95/IMG-20250726-WA0017.jpg"
                  alt="Equipe JAMAAW trabalhando na organização de cabos em Maceió"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">Equipe em Campo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={<CheckCircle className="w-6 h-6 text-white" />}
              title="Ruas Concluídas"
              value={stats.completed}
              gradient="from-green-500 to-green-600"
            />
            <StatsCard
              icon={<Clock className="w-6 h-6 text-white" />}
              title="Em Andamento"
              value={stats.inProgress}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatsCard
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              title="Planejadas"
              value={stats.planned}
              gradient="from-blue-500 to-blue-600"
            />
            <StatsCard
              icon={<Award className="w-6 h-6 text-white" />}
              title="Total de Ruas"
              value={stats.total}
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      {!isLoading && recentActivity.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Atividade Recente
                </h2>
                <p className="text-xl text-slate-600 mb-8">
                  Acompanhe o progresso dos nossos trabalhos nas ruas de Maceió
                </p>
                <Timeline items={recentActivity} />
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Nosso Compromisso
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">Licenciados pela Prefeitura</h4>
                      <p className="text-slate-600">Empresa oficialmente autorizada para prestação de serviços em Maceió.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">Equipe Especializada</h4>
                      <p className="text-slate-600">Profissionais treinados e experientes em organização de cabeamento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">Qualidade Garantida</h4>
                      <p className="text-slate-600">Serviços executados com excelência e responsabilidade.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Nossos Serviços
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Soluções completas para organização e manutenção de infraestrutura de telecomunicações
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Cable className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Remoção de Fios Inativos</h3>
              <p className="text-slate-600 leading-relaxed">
                Identificação e remoção segura de cabos de internet e telefonia que não estão mais em uso, 
                melhorando a organização e segurança.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Agrupamento de Cabos</h3>
              <p className="text-slate-600 leading-relaxed">
                Organização e agrupamento de cabos ativos para otimizar o espaço e 
                facilitar futuras manutenções.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Espinamento Profissional</h3>
              <p className="text-slate-600 leading-relaxed">
                Técnica especializada de espinamento para organização final dos cabos, 
                garantindo durabilidade e estética.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section - Nova Galeria Antes e Depois */}
      <BeforeAfterGallery featured={true} limit={6} />

      {/* Blog Section */}
      <BlogSection featured={true} limit={3} />

      {/* FAQ Section */}
      <FAQChatbot variant="embedded" />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Precisa Organizar o Cabeamento da Sua Rua?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Entre em contato conosco para um orçamento gratuito. 
            Equipe licenciada e experiente em Maceió - AL.
          </p>
          <a
            href="/sugestoes"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block"
          >
            Sugerir Nova Rua
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <Cable className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>JAMAAW</h3>
                  <p className="text-slate-400 text-sm">Organização de Cabeamento</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4">
                Empresa licenciada pela Prefeitura de Maceió, especializada em 
                organização profissional de cabos de telecomunicações.
              </p>
              <div className="flex items-center space-x-2 text-green-400 text-sm mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Licenciada e Ativa</span>
              </div>
              
              {/* Redes Sociais */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-300">Siga-nos</h4>
                <SocialLinks variant="footer" />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Nossos Serviços</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>• Remoção de fios inativos</li>
                <li>• Agrupamento de cabos</li>
                <li>• Espinamento profissional</li>
                <li>• Organização de postes</li>
                <li>• Manutenção preventiva</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Localização & Contato</h4>
              <div className="space-y-3 text-slate-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Maceió - Alagoas, Brasil</span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Para solicitar serviços:</p>
                  <p className="text-sm font-medium text-white">Use o sistema de sugestões do site</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 JAMAAW. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Work Progress Dashboard */}
      <WorkProgressDashboard streets={streets} />

      {/* Floating Components */}
      <SocialLinks variant="floating" />
      <FAQChatbot variant="floating" />
    </div>
  );
}
