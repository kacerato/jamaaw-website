import { useState } from 'react';
import { StreetType } from '@/shared/types';
import { MapPin, Plus, CheckCircle, Clock, AlertCircle, X, Save, Navigation } from 'lucide-react';

interface FallbackMapProps {
  streets: StreetType[];
  onStreetClick?: (street: StreetType) => void;
  isAdmin?: boolean;
  onAddStreet?: (lat: number, lng: number, name: string, status: string) => void;
}

interface NewStreetData {
  lat: number;
  lng: number;
  name: string;
  status: 'planned' | 'in_progress' | 'completed';
  neighborhood: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'planned':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    default:
      return <MapPin className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'in_progress':
      return 'Em Andamento';
    case 'planned':
      return 'Planejada';
    default:
      return 'Desconhecido';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-yellow-500';
    case 'planned':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Simulação de mapa de Maceió com coordenadas aproximadas dos bairros
const MACEIO_NEIGHBORHOODS = [
  { name: 'Centro', lat: -9.6658, lng: -35.7353 },
  { name: 'Ponta Verde', lat: -9.6778, lng: -35.7042 },
  { name: 'Pajuçara', lat: -9.6739, lng: -35.7139 },
  { name: 'Jatiúca', lat: -9.6658, lng: -35.6889 },
  { name: 'Mangabeiras', lat: -9.6478, lng: -35.6828 },
  { name: 'Farol', lat: -9.6389, lng: -35.7242 },
  { name: 'Ponta da Terra', lat: -9.6856, lng: -35.7017 },
  { name: 'Jaraguá', lat: -9.6731, lng: -35.7408 },
  { name: 'Poço', lat: -9.6572, lng: -35.7453 },
  { name: 'Levada', lat: -9.6467, lng: -35.7167 },
];

export default function FallbackMap({ streets, onStreetClick, isAdmin = false, onAddStreet }: FallbackMapProps) {
  const [selectedStreet, setSelectedStreet] = useState<StreetType | null>(null);
  const [newStreetData, setNewStreetData] = useState<NewStreetData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCoordinateForm, setShowCoordinateForm] = useState(false);

  const handleNeighborhoodClick = (neighborhood: any) => {
    if (!isAdmin) return;
    
    setNewStreetData({
      lat: neighborhood.lat,
      lng: neighborhood.lng,
      name: '',
      status: 'planned',
      neighborhood: neighborhood.name
    });
    setShowAddForm(true);
  };

  const handleManualCoordinates = () => {
    setShowCoordinateForm(true);
  };

  const handleAddStreet = async () => {
    if (!newStreetData || !onAddStreet) return;

    try {
      const response = await fetch('/api/admin/streets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newStreetData.name,
          neighborhood: newStreetData.neighborhood || null,
          latitude: newStreetData.lat,
          longitude: newStreetData.lng,
          status: newStreetData.status,
          notes: 'Adicionada via mapa simplificado'
        }),
      });

      if (response.ok) {
        await response.json();
        onAddStreet(newStreetData.lat, newStreetData.lng, newStreetData.name, newStreetData.status);
        setShowAddForm(false);
        setNewStreetData(null);
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding street:', error);
    }
  };

  return (
    <div className="relative">
      {isAdmin && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Plus className="w-4 h-4" />
              <span>Clique em um bairro para adicionar rua</span>
            </div>
            <button
              onClick={handleManualCoordinates}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              Ou inserir coordenadas manualmente
            </button>
          </div>
        </div>
      )}

      <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden shadow-lg relative">
        {/* Mapa simulado de Maceió */}
        <div className="absolute inset-0 p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Maceió - Alagoas</h3>
            <p className="text-sm text-slate-600">Mapa Simplificado (Google Maps indisponível)</p>
          </div>

          {/* Bairros */}
          <div className="grid grid-cols-3 gap-2 h-64">
            {MACEIO_NEIGHBORHOODS.map((neighborhood) => (
              <div
                key={neighborhood.name}
                onClick={() => handleNeighborhoodClick(neighborhood)}
                className={`bg-white rounded-lg p-2 shadow-sm border-2 transition-all ${
                  isAdmin 
                    ? 'cursor-pointer hover:border-blue-400 hover:shadow-md' 
                    : 'border-slate-200'
                } flex flex-col items-center justify-center`}
              >
                <MapPin className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-xs font-medium text-center">{neighborhood.name}</span>
                
                {/* Mostrar ruas do bairro */}
                {streets.filter(s => s.neighborhood === neighborhood.name).map((street) => (
                  <div
                    key={street.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStreet(street);
                      onStreetClick?.(street);
                    }}
                    className="mt-1 flex items-center space-x-1 cursor-pointer hover:bg-slate-50 px-1 py-0.5 rounded"
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(street.status)}`}></div>
                    <span className="text-xs text-slate-600 truncate" title={street.name}>
                      {street.name.length > 10 ? street.name.substring(0, 10) + '...' : street.name}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-sm">
            <div className="text-xs font-medium text-slate-700 mb-1">Status:</div>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Concluída</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Em Andamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs">Planejada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Street Details Modal */}
      {selectedStreet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedStreet.status)}
                <h3 className="text-lg font-semibold text-slate-900">{selectedStreet.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStreet(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedStreet.neighborhood && (
                <p className="text-sm text-slate-600">
                  <strong>Bairro:</strong> {selectedStreet.neighborhood}
                </p>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                  {getStatusText(selectedStreet.status)}
                </span>
              </div>
              
              {selectedStreet.notes && (
                <p className="text-sm text-slate-600">
                  <strong>Observações:</strong> {selectedStreet.notes}
                </p>
              )}
              
              {selectedStreet.completed_at && (
                <p className="text-sm text-green-600">
                  <strong>Concluída em:</strong> {new Date(selectedStreet.completed_at).toLocaleDateString('pt-BR')}
                </p>
              )}
              
              {selectedStreet.started_at && selectedStreet.status === 'in_progress' && (
                <p className="text-sm text-yellow-600">
                  <strong>Iniciada em:</strong> {new Date(selectedStreet.started_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Street Modal */}
      {showAddForm && newStreetData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Adicionar Nova Rua</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewStreetData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Rua</label>
                <input
                  type="text"
                  value={newStreetData.name}
                  onChange={(e) => setNewStreetData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Ex: Rua das Flores"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bairro</label>
                <input
                  type="text"
                  value={newStreetData.neighborhood}
                  onChange={(e) => setNewStreetData(prev => prev ? { ...prev, neighborhood: e.target.value } : null)}
                  placeholder="Ex: Centro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status Inicial</label>
                <select
                  value={newStreetData.status}
                  onChange={(e) => setNewStreetData(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="planned">Planejada</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Localização:</strong><br />
                  Bairro: {newStreetData.neighborhood}<br />
                  Lat: {newStreetData.lat.toFixed(6)}<br />
                  Lng: {newStreetData.lng.toFixed(6)}
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddStreet}
                  disabled={!newStreetData.name}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStreetData(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Coordinates Modal */}
      {showCoordinateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Coordenadas Manuais</h3>
              <button
                onClick={() => setShowCoordinateForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="-9.6658"
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setNewStreetData(prev => prev ? { ...prev, lat } : {
                          lat,
                          lng: -35.7353,
                          name: '',
                          status: 'planned',
                          neighborhood: ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="-35.7353"
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) {
                        setNewStreetData(prev => prev ? { ...prev, lng } : {
                          lat: -9.6658,
                          lng,
                          name: '',
                          status: 'planned',
                          neighborhood: ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Dica:</p>
                    <p className="text-xs text-blue-700">
                      Use o Google Maps para encontrar as coordenadas exatas. 
                      Clique com o botão direito no local desejado e copie as coordenadas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCoordinateForm(false);
                    if (newStreetData) {
                      setShowAddForm(true);
                    }
                  }}
                  disabled={!newStreetData?.lat || !newStreetData?.lng}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
                <button
                  onClick={() => {
                    setShowCoordinateForm(false);
                    setNewStreetData(null);
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
