import { useEffect, useState } from 'react';
import { StreetType } from '@/shared/types';
import { Calendar, Clock, TrendingUp, Users, Zap, CheckCircle2, Timer, Activity } from 'lucide-react';

interface WorkProgressDashboardProps {
  streets: StreetType[];
}

interface DashboardStats {
  totalStreets: number;
  completedStreets: number;
  inProgressStreets: number;
  plannedStreets: number;
  completionRate: number;
  averageCompletionTime: number;
  streetsCompletedThisMonth: number;
  estimatedCompletionDate: Date | null;
}

interface WorkActivity {
  id: string;
  type: 'started' | 'completed' | 'planned';
  streetName: string;
  neighborhood?: string;
  date: Date;
  duration?: number; // in hours
}

export default function WorkProgressDashboard({ streets }: WorkProgressDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalStreets: 0,
    completedStreets: 0,
    inProgressStreets: 0,
    plannedStreets: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    streetsCompletedThisMonth: 0,
    estimatedCompletionDate: null,
  });
  
  const [recentActivities, setRecentActivities] = useState<WorkActivity[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    calculateStats();
    generateRecentActivities();
  }, [streets]);

  const calculateStats = () => {
    const totalStreets = streets.length;
    const completedStreets = streets.filter(s => s.status === 'completed').length;
    const inProgressStreets = streets.filter(s => s.status === 'in_progress').length;
    const plannedStreets = streets.filter(s => s.status === 'planned').length;
    
    const completionRate = totalStreets > 0 ? (completedStreets / totalStreets) * 100 : 0;
    
    // Calculate streets completed this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const streetsCompletedThisMonth = streets.filter(s => 
      s.status === 'completed' && 
      s.completed_at && 
      new Date(s.completed_at) >= startOfMonth
    ).length;
    
    // Calculate average completion time (mock data for now)
    const averageCompletionTime = 6; // hours
    
    // Estimate completion date for remaining streets
    const remainingStreets = inProgressStreets + plannedStreets;
    const estimatedDaysToComplete = remainingStreets * 2; // 2 days per street average
    const estimatedCompletionDate = remainingStreets > 0 
      ? new Date(Date.now() + estimatedDaysToComplete * 24 * 60 * 60 * 1000)
      : null;

    setStats({
      totalStreets,
      completedStreets,
      inProgressStreets,
      plannedStreets,
      completionRate,
      averageCompletionTime,
      streetsCompletedThisMonth,
      estimatedCompletionDate,
    });
  };

  const generateRecentActivities = () => {
    const activities: WorkActivity[] = [];
    
    // Generate activities from street data
    streets.forEach(street => {
      if (street.completed_at) {
        activities.push({
          id: `completed-${street.id}`,
          type: 'completed',
          streetName: street.name,
          neighborhood: street.neighborhood || undefined,
          date: new Date(street.completed_at),
          duration: Math.floor(Math.random() * 8) + 4, // 4-12 hours
        });
      }
      
      if (street.started_at) {
        activities.push({
          id: `started-${street.id}`,
          type: 'started',
          streetName: street.name,
          neighborhood: street.neighborhood || undefined,
          date: new Date(street.started_at),
        });
      }
    });
    
    // Sort by date (most recent first) and take last 10
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentActivities(activities.slice(0, 10));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'started':
        return <Timer className="w-4 h-4 text-blue-600" />;
      case 'planned':
        return <Calendar className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityText = (activity: WorkActivity) => {
    switch (activity.type) {
      case 'completed':
        return `Trabalho concluído na ${activity.streetName}${activity.duration ? ` em ${activity.duration}h` : ''}`;
      case 'started':
        return `Trabalho iniciado na ${activity.streetName}`;
      case 'planned':
        return `Trabalho planejado para ${activity.streetName}`;
      default:
        return `Atividade na ${activity.streetName}`;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} min atrás`;
    return 'Agora mesmo';
  };

  if (streets.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Collapsed View */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <div className="hidden group-hover:block animate-slide-up">
              <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
            </div>
          </div>
          {stats.inProgressStreets > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              {stats.inProgressStreets}
            </div>
          )}
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Dashboard JAMAAW</h3>
                <p className="text-blue-100 text-sm">Progresso em Tempo Real</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Concluídas</span>
              </div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {stats.completedStreets}
              </div>
              <div className="text-xs text-green-600">
                {stats.completionRate.toFixed(1)}% do total
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Em Andamento</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {stats.inProgressStreets}
              </div>
              <div className="text-xs text-blue-600">
                Equipes trabalhando
              </div>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-800">Planejadas</span>
              </div>
              <div className="text-2xl font-bold text-orange-700 mt-1">
                {stats.plannedStreets}
              </div>
              <div className="text-xs text-orange-600">
                Próximas no cronograma
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">Este Mês</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                {stats.streetsCompletedThisMonth}
              </div>
              <div className="text-xs text-purple-600">
                Ruas finalizadas
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Progresso Geral</span>
              <span className="text-slate-600">{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Tempo Médio</span>
              </div>
              <span className="text-sm text-slate-600">{stats.averageCompletionTime}h</span>
            </div>

            {stats.estimatedCompletionDate && (
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Previsão</span>
                </div>
                <span className="text-sm text-slate-600">
                  {stats.estimatedCompletionDate.toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="border-t border-slate-200">
            <div className="p-4">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Atividades Recentes</span>
              </h4>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nenhuma atividade recente
                  </p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 leading-tight">
                          {getActivityText(activity)}
                        </p>
                        {activity.neighborhood && (
                          <p className="text-xs text-slate-500">
                            Bairro: {activity.neighborhood}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Equipe JAMAAW</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Atualizado agora</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
