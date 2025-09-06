import { useState, useEffect, useCallback } from 'react';
import LeafletMap from './LeafletMap';
import { StreetType } from '@/shared/types';

interface RefreshableLeafletMapProps {
  streets: StreetType[];
  onStreetClick?: (street: StreetType) => void;
  isAdmin?: boolean;
  onAddStreet?: (lat: number, lng: number, name: string, status: string) => void;
  refreshTrigger?: number; // Prop para forçar atualização
}

export default function RefreshableLeafletMap({ 
  streets, 
  onStreetClick, 
  isAdmin = false, 
  onAddStreet,
  refreshTrigger = 0
}: RefreshableLeafletMapProps) {
  const [key, setKey] = useState(0);

  // Força re-render do mapa quando refreshTrigger muda
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [refreshTrigger]);

  const handleAddStreet = useCallback((lat: number, lng: number, name: string, status: string) => {
    onAddStreet?.(lat, lng, name, status);
    // Força atualização do mapa após adicionar rua
    setKey(prev => prev + 1);
  }, [onAddStreet]);

  return (
    <LeafletMap
      key={key}
      streets={streets}
      onStreetClick={onStreetClick}
      isAdmin={isAdmin}
      onAddStreet={handleAddStreet}
    />
  );
}

