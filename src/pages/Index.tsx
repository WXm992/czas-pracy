
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, Calendar, Calculator } from 'lucide-react';
import EmployeeForm from '@/components/EmployeeForm';
import TimeTracker from '@/components/TimeTracker';
import ReportsView from '@/components/ReportsView';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate: number;
  startDate: string;
  phone: string;
  email: string;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

const Index = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      position: 'Murarz',
      hourlyRate: 25,
      startDate: '2024-01-15',
      phone: '+48 123 456 789',
      email: 'jan.kowalski@example.com'
    },
    {
      id: '2',
      firstName: 'Anna',
      lastName: 'Nowak',
      position: 'Zbrojarz',
      hourlyRate: 28,
      startDate: '2024-02-01',
      phone: '+48 987 654 321',
      email: 'anna.nowak@example.com'
    }
  ]);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      employeeId: '1',
      date: '2024-06-24',
      startTime: '08:00',
      endTime: '16:00',
      breakTime: 30,
      description: 'Budowa muru',
      type: 'work'
    }
  ]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();

  const handleSaveEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === employee.id ? employee : emp));
    } else {
      setEmployees(prev => [...prev, employee]);
    }
    setShowEmployeeForm(false);
    setEditingEmployee(undefined);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setTimeEntries(prev => prev.filter(entry => entry.employeeId !== employeeId));
  };

  const handleSaveTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
  };

  const stats = [
    {
      title: 'Aktywni Pracownicy',
      value: employees.length.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Wpisy Dzisiaj',
      value: timeEntries.filter(entry => 
        entry.date === new Date().toISOString().split('T')[0]
      ).length.toString(),
      icon: Clock,
      color: 'bg-green-500'
    },
    {
      title: 'Wnioski Urlopowe',
      value: timeEntries.filter(entry => entry.type === 'vacation').length.toString(),
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Suma Wypłat',
      value: `${timeEntries
        .filter(entry => entry.type === 'work')
        .reduce((sum, entry) => {
          const employee = employees.find(emp => emp.id === entry.employeeId);
          if (!employee) return sum;
          
          const start = new Date(`2000-01-01T${entry.startTime}`);
          const end = new Date(`2000-01-01T${entry.endTime}`);
          const diffMs = end.getTime() - start.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          const workHours = Math.max(0, diffHours - (entry.breakTime / 60));
          
          return sum + (workHours * employee.hourlyRate);
        }, 0)
        .toFixed(0)} zł`,
      icon: Calculator,
      color: 'bg-purple-500'
    }
  ];

  if (showEmployeeForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(undefined);
            }}
          />
        </div>
      </div>
    );
  }

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

        {/* Główna zawartość */}
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees">Pracownicy</TabsTrigger>
            <TabsTrigger value="timetracking">Czas Pracy</TabsTrigger>
            <TabsTrigger value="reports">Raporty</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Zarządzanie Pracownikami</h2>
              <Button onClick={() => setShowEmployeeForm(true)}>
                <Users className="w-4 h-4 mr-2" />
                Dodaj Pracownika
              </Button>
            </div>
            
            <div className="grid gap-4">
              {employees.map(employee => (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-gray-600 mb-1">{employee.position}</p>
                        <p className="text-gray-600 mb-1">Stawka: {employee.hourlyRate} zł/h</p>
                        <p className="text-gray-600 mb-1">Tel: {employee.phone}</p>
                        <p className="text-gray-600">Email: {employee.email}</p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          Edytuj
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timetracking">
            <TimeTracker
              employees={employees}
              onSave={handleSaveTimeEntry}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView
              employees={employees}
              timeEntries={timeEntries}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
