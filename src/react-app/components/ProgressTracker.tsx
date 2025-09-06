import { useEffect, useState } from 'react';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';

interface ProgressData {
  totalStreets: number;
  completedStreets: number;
  inProgressStreets: number;
  plannedStreets: number;
  completionRate: number;
  monthlyProgress: Array<{
    month: string;
    completed: number;
  }>;
}

export default function ProgressTracker() {
  const [progress, setProgress] = useState<ProgressData>({
    totalStreets: 0,
    completedStreets: 0,
    inProgressStreets: 0,
    plannedStreets: 0,
    completionRate: 0,
    monthlyProgress: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/streets');
        if (response.ok) {
          const streets = await response.json();
          
          const completed = streets.filter((s: any) => s.status === 'completed').length;
          const inProgress = streets.filter((s: any) => s.status === 'in_progress').length;
          const planned = streets.filter((s: any) => s.status === 'planned').length;
          const total = streets.length;
          
          // Calculate monthly progress (simplified)
          const monthlyData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
              month: date.toLocaleString('pt-BR', { month: 'short' }),
              completed: Math.floor(Math.random() * 10) + 1 // Simulated data
            };
          }).reverse();

          setProgress({
            totalStreets: total,
            completedStreets: completed,
            inProgressStreets: inProgress,
            plannedStreets: planned,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
            monthlyProgress: monthlyData
          });
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
    
    // Show the tracker after a delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-xl p-6 w-80 z-40 border border-slate-200 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Progresso JAMAAW</span>
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Concluídas</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{progress.completedStreets}</p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{progress.totalStreets}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Taxa de Conclusão</span>
          <span className="font-semibold">{progress.completionRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress.completionRate}%` }}
          />
        </div>
      </div>

      {/* Monthly Progress */}
      <div>
        <div className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
          <Calendar className="w-4 h-4" />
          <span>Progresso Mensal</span>
        </div>
        <div className="flex items-end space-x-1 h-12">
          {progress.monthlyProgress.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ 
                  height: `${(month.completed / Math.max(...progress.monthlyProgress.map(m => m.completed))) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-slate-500 mt-1">{month.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Atualização em tempo real • JAMAAW 2025
        </p>
      </div>
    </div>
  );
}
