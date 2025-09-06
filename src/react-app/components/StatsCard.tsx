import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  gradient: string;
}

export default function StatsCard({ icon, title, value, change, changeType, gradient }: StatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="text-white">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              {icon}
            </div>
            <h3 className="text-lg font-semibold opacity-90">{title}</h3>
          </div>
          <div className="text-3xl font-bold mb-2">{value}</div>
          {change && (
            <div className={`text-sm flex items-center ${
              changeType === 'positive' ? 'text-green-200' :
              changeType === 'negative' ? 'text-red-200' : 'text-white/70'
            }`}>
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
