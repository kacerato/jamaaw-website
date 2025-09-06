import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { StreetType } from '@/shared/types';
import { MapPin, Plus, CheckCircle, Clock, AlertCircle, X, Save } from 'lucide-react';

interface ClickableMapProps {
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

const MACEIO_CENTER = { lat: -9.6658, lng: -35.7353 };



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

// Component for handling map clicks
function MapClickHandler({ 
  isAdmin, 
  onMapClick 
}: { 
  isAdmin: boolean; 
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const apiIsLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!map || !isAdmin || !apiIsLoaded) return;

    const listener = map.addListener('click', (e: any) => {
      if (e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [map, isAdmin, onMapClick, apiIsLoaded]);

  return null;
}

// Inner component that uses the map
function MapContent({ streets, onStreetClick, isAdmin = false, onAddStreet }: ClickableMapProps) {
  const [selectedStreet, setSelectedStreet] = useState<StreetType | null>(null);
  const [newStreetData, setNewStreetData] = useState<NewStreetData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const apiIsLoaded = useApiIsLoaded();

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAdmin) return;
    
    setNewStreetData({
      lat,
      lng,
      name: '',
      status: 'planned',
      neighborhood: ''
    });
    setShowAddForm(true);
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
          notes: 'Adicionada via mapa interativo'
        }),
      });

      if (response.ok) {
        await response.json();
        onAddStreet(newStreetData.lat, newStreetData.lng, newStreetData.name, newStreetData.status);
        setShowAddForm(false);
        setNewStreetData(null);
        // Refresh page to show the new street
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding street:', error);
    }
  };

  if (!apiIsLoaded) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Carregando API do mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isAdmin && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Plus className="w-4 h-4" />
            <span>Clique no mapa para adicionar uma rua</span>
          </div>
        </div>
      )}

      <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <Map
          defaultCenter={MACEIO_CENTER}
          defaultZoom={13}
          mapId="jamaaw-clickable-map"
          style={{ width: '100%', height: '100%' }}
          gestureHandling="greedy"
          clickableIcons={false}
        >
          <MapClickHandler isAdmin={isAdmin} onMapClick={handleMapClick} />
          
          {streets.map((street) => {
            // Only show streets with coordinates
            if (!street.latitude || !street.longitude) return null;

            return (
              <Marker
                key={street.id}
                position={{ lat: street.latitude, lng: street.longitude }}
                onClick={() => {
                  setSelectedStreet(street);
                  onStreetClick?.(street);
                }}
              />
            );
          })}

          {/* Temporary marker for new street */}
          {newStreetData && (
            <Marker
              position={{ lat: newStreetData.lat, lng: newStreetData.lng }}
            />
          )}

          {selectedStreet && selectedStreet.latitude && selectedStreet.longitude && (
            <InfoWindow
              position={{ lat: selectedStreet.latitude, lng: selectedStreet.longitude }}
              onCloseClick={() => setSelectedStreet(null)}
            >
              <div className="p-3 max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(selectedStreet.status)}
                  <h3 className="font-semibold text-slate-900">{selectedStreet.name}</h3>
                </div>
                
                {selectedStreet.neighborhood && (
                  <p className="text-sm text-slate-600 mb-2">
                    Bairro: {selectedStreet.neighborhood}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {getStatusText(selectedStreet.status)}
                  </span>
                </div>
                
                {selectedStreet.notes && (
                  <p className="text-sm text-slate-600 mb-2">
                    {selectedStreet.notes}
                  </p>
                )}
                
                {selectedStreet.completed_at && (
                  <p className="text-xs text-green-600">
                    Concluída em: {new Date(selectedStreet.completed_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                
                {selectedStreet.started_at && selectedStreet.status === 'in_progress' && (
                  <p className="text-xs text-yellow-600">
                    Iniciada em: {new Date(selectedStreet.started_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

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
                  <strong>Coordenadas:</strong><br />
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
    </div>
  );
}

export default function ClickableMap({ streets, onStreetClick, isAdmin = false, onAddStreet }: ClickableMapProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/maps/key');
        if (!response.ok) {
          throw new Error('Failed to fetch API key');
        }
        const data = await response.json();
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching Google Maps API key:', error);
        setError('Erro ao carregar o mapa. Verifique se a chave da API do Google Maps está configurada.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const handleApiError = () => {
    setError('Erro ao carregar a API do Google Maps. Verifique se o faturamento está ativo na conta do Google Cloud.');
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 font-medium mb-2">Erro ao carregar o mapa</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-medium mb-2">Mapa não disponível</p>
          <p className="text-slate-600 text-sm">A chave da API do Google Maps não está configurada.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} onLoad={() => console.log('Maps API loaded')} onError={handleApiError}>
      <MapContent 
        streets={streets}
        onStreetClick={onStreetClick}
        isAdmin={isAdmin}
        onAddStreet={onAddStreet}
      />
    </APIProvider>
  );
}
