import { CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';

interface TimelineItem {
  id: number;
  street: string;
  neighborhood: string;
  status: 'completed' | 'in_progress' | 'planned';
  date: string;
  description?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          lineColor: 'border-green-300',
        };
      case 'in_progress':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          lineColor: 'border-yellow-300',
        };
      case 'planned':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          lineColor: 'border-red-300',
        };
      default:
        return {
          icon: <MapPin className="w-5 h-5" />,
          color: 'text-slate-600',
          bgColor: 'bg-slate-100',
          lineColor: 'border-slate-300',
        };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          const isLast = index === items.length - 1;

          return (
            <li key={item.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className={`absolute left-4 top-10 -ml-px h-full w-0.5 border-l-2 ${config.lineColor}`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center ring-4 ring-white ${config.color}`}>
                      {config.icon}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-slate-900 font-medium">
                        {item.street}
                        {item.neighborhood && (
                          <span className="text-slate-500 font-normal"> - {item.neighborhood}</span>
                        )}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500 capitalize">
                        {item.status === 'completed' ? 'Concluída' :
                         item.status === 'in_progress' ? 'Em Andamento' : 'Planejada'}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-slate-500">
                      <time dateTime={item.date}>
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
