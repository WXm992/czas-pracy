
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Building, UserCheck } from 'lucide-react';

interface StatsCardsProps {
  projects: Array<{ status: string }>;
  managers: Array<any>;
  employees: Array<any>;
  timeEntries: Array<{ date: string }>;
}

const StatsCards: React.FC<StatsCardsProps> = ({ projects, managers, employees, timeEntries }) => {
  const stats = [
    {
      title: 'Aktywne Budowy',
      value: projects.filter(p => p.status === 'active').length.toString(),
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      title: 'Kierownicy',
      value: managers.length.toString(),
      icon: UserCheck,
      color: 'bg-purple-500'
    },
    {
      title: 'Aktywni Pracownicy',
      value: employees.length.toString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Wpisy Dzisiaj',
      value: timeEntries.filter(entry => 
        entry.date === new Date().toISOString().split('T')[0]
      ).length.toString(),
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;
