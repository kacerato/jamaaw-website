import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X, Navigation } from 'lucide-react';
import { StreetType } from '@/shared/types';
import LeafletMap from './LeafletMap';

interface EnhancedMapProps {
  streets: StreetType[];
  onStreetSelect?: (street: StreetType) => void;
}

export default function EnhancedMap({ streets, onStreetSelect }: EnhancedMapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStreets, setFilteredStreets] = useState<StreetType[]>(streets);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<StreetType[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFilteredStreets(streets);
  }, [streets]);

  useEffect(() => {
    let filtered = streets;

    // Filtrar por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(street => street.status === selectedStatus);
    }

    // Filtrar por bairro
    if (selectedNeighborhood !== 'all') {
      filtered = filtered.filter(street => street.neighborhood === selectedNeighborhood);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(street =>
        street.name.toLowerCase().includes(searchLower) ||
        (street.neighborhood && street.neighborhood.toLowerCase().includes(searchLower))
      );
    }

    setFilteredStreets(filtered);

    // Atualizar resultados de busca para dropdown
    if (searchTerm.trim() && isSearchFocused) {
      const searchResults = streets
        .filter(street =>
          street.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (street.neighborhood && street.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10);
      setSearchResults(searchResults);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, selectedStatus, selectedNeighborhood, streets, isSearchFocused]);

  const neighborhoods = Array.from(new Set(streets.map(s => s.neighborhood).filter(Boolean))).sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'planned':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const handleStreetSelect = (street: StreetType) => {
    setSearchTerm(street.name);
    setSearchResults([]);
    setIsSearchFocused(false);
    if (onStreetSelect) {
      onStreetSelect(street);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar rua ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.map((street) => (
                  <button
                    key={street.id}
                    onClick={() => handleStreetSelect(street)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{street.name}</div>
                        {street.neighborhood && (
                          <div className="text-sm text-slate-500">{street.neighborhood}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(street.status)}`}>
                        {getStatusLabel(street.status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="completed">Concluídas</option>
              <option value="in_progress">Em Andamento</option>
              <option value="planned">Planejadas</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>

          {/* Neighborhood Filter */}
          <div className="relative">
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Todos os Bairros</option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood || ''}>
                  {neighborhood}
                </option>
              ))}
            </select>
            <Navigation className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Mostrando {filteredStreets.length} de {streets.length} ruas
            </span>
            {(searchTerm || selectedStatus !== 'all' || selectedNeighborhood !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedNeighborhood('all');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mapa Interativo
          </h3>
          <p className="text-slate-600">
            Visualize o progresso dos trabalhos de organização de cabeamento em Maceió
          </p>
        </div>

        {/* Map placeholder - aqui você integraria com Leaflet ou Google Maps */}
        <LeafletMap 
          streets={filteredStreets}
          onStreetClick={onStreetSelect}
          isAdmin={false}
        />
      </div>

      {/* Streets List */}
      {filteredStreets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Lista de Ruas
            </h3>
          </div>
          
          <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
            {filteredStreets.map((street) => (
              <div
                key={street.id}
                className="p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleStreetSelect(street)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{street.name}</h4>
                    {street.neighborhood && (
                      <p className="text-sm text-slate-600">{street.neighborhood}</p>
                    )}
                    {street.notes && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{street.notes}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(street.status)}`}>
                      {getStatusLabel(street.status)}
                    </span>
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

