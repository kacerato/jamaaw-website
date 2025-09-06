import { useEffect, useState } from 'react';
import { StreetType } from '@/shared/types';
import Header from '@/react-app/components/Header';
import EnhancedMap from '@/react-app/components/EnhancedMap';
import ProgressTracker from '@/react-app/components/ProgressTracker';
import { MapPin, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';

export default function MapPage() {
  const [streets, setStreets] = useState<StreetType[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    const fetchStreets = async () => {
      try {
        const response = await fetch('/api/streets');
        if (!response.ok) {
          throw new Error('Failed to fetch streets');
        }
        const data = await response.json();
        setStreets(data);
      } catch (error) {
        console.error('Error fetching streets:', error);
        setStreets([]);
      }
    };

    fetchStreets();
  }, []);

  const getStatusCount = (status: string) => {
    return streets.filter(street => street.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mapa de Ruas - Maceió
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Acompanhe o progresso dos serviços de organização de cabeamento em tempo real
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Ruas</p>
                  <p className="text-2xl font-bold text-slate-900">{streets.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Concluídas</p>
                  <p className="text-2xl font-bold text-green-700">{getStatusCount('completed')}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-700">{getStatusCount('in_progress')}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Planejadas</p>
                  <p className="text-2xl font-bold text-red-700">{getStatusCount('planned')}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Filtrar por status:</span>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as ruas</option>
              <option value="completed">Concluídas</option>
              <option value="in_progress">Em andamento</option>
              <option value="planned">Planejadas</option>
            </select>
          </div>
        </div>

        {/* Enhanced Map with Search */}
        <EnhancedMap 
          streets={streets}
          onStreetSelect={() => {}}
        />

        {/* Legend */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Legenda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-slate-700">Ruas Concluídas</span>
              <span className="text-sm text-slate-500">- Serviço finalizado</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium text-slate-700">Ruas em Andamento</span>
              <span className="text-sm text-slate-500">- Equipe trabalhando</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-slate-700">Ruas Planejadas</span>
              <span className="text-sm text-slate-500">- Próximas no cronograma</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker />
      </div>
    </div>
  );
}
