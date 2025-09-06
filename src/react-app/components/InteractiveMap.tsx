import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useApiIsLoaded } from '@vis.gl/react-google-maps';
import { StreetType } from '@/shared/types';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface InteractiveMapProps {
  streets: StreetType[];
  onStreetClick?: (street: StreetType) => void;
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

// Inner component that uses the map
function MapContent({ streets, onStreetClick }: InteractiveMapProps) {
  const [selectedStreet, setSelectedStreet] = useState<StreetType | null>(null);
  const apiIsLoaded = useApiIsLoaded();

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
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <Map
        defaultCenter={MACEIO_CENTER}
        defaultZoom={12}
        mapId="jamaaw-map"
        style={{ width: '100%', height: '100%' }}
      >
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
  );
}

export default function InteractiveMap({ streets, onStreetClick }: InteractiveMapProps) {
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
      />
    </APIProvider>
  );
}
