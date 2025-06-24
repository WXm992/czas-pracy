
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Calendar, Calculator } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Aktywni Pracownicy',
      value: '12',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Godziny Dzisiaj',
      value: '96',
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Wnioski Urlopowe',
      value: '3',
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Do Wypłaty',
      value: '24,500 zł',
      icon: Calculator,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Rejestracji Czasu Pracy
          </h1>
          <p className="text-gray-600">
            Zarządzanie czasem pracy dla firm budowlanych
          </p>
        </div>

        {/* Statystyki */}
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

        {/* Szybkie akcje */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Zarządzaj Pracownikami</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Dodawaj, edytuj i zarządzaj danymi pracowników
              </p>
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Pracownicy
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rejestracja Czasu</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Wprowadź godziny pracy i nieobecności
              </p>
              <Button className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Czas Pracy
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raporty</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generuj raporty miesięczne i roczne
              </p>
              <Button className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Raporty
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
