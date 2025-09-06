import { useState } from 'react';
import { Info } from 'lucide-react';

export default function MaceioFlag() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <div 
        className="w-16 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
        onClick={() => setShowInfo(!showInfo)}
      >
        {/* Flag design representing Maceió */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-white to-green-500">
          {/* Blue top section */}
          <div className="h-1/3 bg-blue-500"></div>
          {/* White middle section */}
          <div className="h-1/3 bg-white flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
          {/* Green bottom section */}
          <div className="h-1/3 bg-green-500"></div>
        </div>
        
        {/* Info icon */}
        <div className="absolute bottom-0 right-0 bg-white rounded-tl-lg p-0.5">
          <Info className="w-2 h-2 text-blue-600" />
        </div>
      </div>

      {/* Info popup */}
      {showInfo && (
        <div className="absolute bottom-14 left-0 bg-white rounded-lg shadow-xl p-4 w-64 z-50 border border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-6 bg-gradient-to-b from-blue-500 via-white to-green-500 rounded border"></div>
            <h3 className="font-semibold text-slate-900">Maceió - AL</h3>
          </div>
          <p className="text-sm text-slate-600 mb-2">
            Capital de Alagoas, conhecida por suas belas praias e rica cultura nordestina.
          </p>
          <div className="text-xs text-slate-500">
            <p>População: ~1 milhão de habitantes</p>
            <p>Fundada: 1815</p>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
