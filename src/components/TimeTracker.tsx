
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

interface TimeTrackerProps {
  employees: Array<{ id: string; firstName: string; lastName: string; projectId?: string }>;
  projects: Array<{ id: string; name: string }>;
  currentProjectId?: string;
  onSave: (entry: TimeEntry) => void;
}

interface EmployeeTimeData {
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ employees, projects, currentProjectId, onSave }) => {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Stan dla każdego pracownika
  const [employeesData, setEmployeesData] = useState<Record<string, EmployeeTimeData>>({});

  // Filter employees by selected project
  const filteredEmployees = selectedProjectId 
    ? employees.filter(emp => emp.projectId === selectedProjectId)
    : employees;

  const updateEmployeeData = (employeeId: string, field: keyof EmployeeTimeData, value: string | number) => {
    setEmployeesData(prev => ({
      ...prev,
      [employeeId]: {
        startTime: '08:00',
        endTime: '16:00',
        breakTime: 30,
        description: '',
        type: 'work',
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const getEmployeeData = (employeeId: string): EmployeeTimeData => {
    return employeesData[employeeId] || {
      startTime: '08:00',
      endTime: '16:00',
      breakTime: 30,
      description: '',
      type: 'work'
    };
  };

  const calculateHours = (employeeId: string): string => {
    const data = getEmployeeData(employeeId);
    if (data.startTime && data.endTime && data.type === 'work') {
      const start = new Date(`2000-01-01T${data.startTime}`);
      const end = new Date(`2000-01-01T${data.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const workHours = Math.max(0, diffHours - (data.breakTime / 60));
      return workHours.toFixed(2);
    }
    return '0.00';
  };

  const handleSaveAll = () => {
    if (!selectedProjectId || !selectedDate) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać budowę i datę",
        variant: "destructive"
      });
      return;
    }

    const entries = Object.entries(employeesData).filter(([_, data]) => {
      // Zapisz tylko jeśli wprowadzono jakieś dane lub zmieniono typ z 'work'
      return data.type !== 'work' || data.startTime !== '08:00' || data.endTime !== '16:00' || data.description.trim() !== '';
    });

    if (entries.length === 0) {
      toast({
        title: "Informacja",
        description: "Nie wprowadzono żadnych danych do zapisania",
        variant: "destructive"
      });
      return;
    }

    entries.forEach(([employeeId, data]) => {
      const entry: TimeEntry = {
        id: `${employeeId}-${selectedDate}-${Date.now()}`,
        employeeId,
        projectId: selectedProjectId,
        date: selectedDate,
        ...data,
      };
      onSave(entry);
    });

    toast({
      title: "Sukces",
      description: `Zapisano czas pracy dla ${entries.length} pracowników`
    });

    // Wyczyść dane
    setEmployeesData({});
  };

  const handleSaveEmployee = (employeeId: string) => {
    if (!selectedProjectId || !selectedDate) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać budowę i datę",
        variant: "destructive"
      });
      return;
    }

    const data = getEmployeeData(employeeId);
    const entry: TimeEntry = {
      id: `${employeeId}-${selectedDate}-${Date.now()}`,
      employeeId,
      projectId: selectedProjectId,
      date: selectedDate,
      ...data,
    };

    onSave(entry);
    
    const employee = employees.find(emp => emp.id === employeeId);
    toast({
      title: "Sukces",
      description: `Zapisano czas pracy dla ${employee?.firstName} ${employee?.lastName}`
    });

    // Wyczyść dane dla tego pracownika
    setEmployeesData(prev => {
      const newData = { ...prev };
      delete newData[employeeId];
      return newData;
    });
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Rejestracja Czasu Pracy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filtry globalne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {!currentProjectId && (
              <div>
                <Label htmlFor="project">Budowa *</Label>
                <select
                  id="project"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setEmployeesData({}); // Wyczyść dane przy zmianie projektu
                  }}
                  required
                >
                  <option value="">Wybierz budowę</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Lista pracowników */}
          {selectedProjectId && filteredEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lista Pracowników</h3>
                <Button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700">
                  Zapisz Wszystkich
                </Button>
              </div>

              <div className="space-y-4">
                {filteredEmployees.map(employee => {
                  const data = getEmployeeData(employee.id);
                  return (
                    <Card key={employee.id} className="p-4">
                      <div className="space-y-4">
                        {/* Nagłówek z nazwiskiem i przyciskiem zapisu */}
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium">
                            {employee.firstName} {employee.lastName}
                          </h4>
                          <Button 
                            size="sm"
                            onClick={() => handleSaveEmployee(employee.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Zapisz
                          </Button>
                        </div>

                        {/* Typ wpisu */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Typ wpisu</Label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md"
                              value={data.type}
                              onChange={(e) => updateEmployeeData(employee.id, 'type', e.target.value as any)}
                            >
                              <option value="work">Praca</option>
                              <option value="vacation">Urlop</option>
                              <option value="sick">Zwolnienie</option>
                              <option value="absence">Nieobecność</option>
                            </select>
                          </div>

                          {data.type === 'work' && (
                            <>
                              <div>
                                <Label>Godz. rozpoczęcia</Label>
                                <Input
                                  type="time"
                                  value={data.startTime}
                                  onChange={(e) => updateEmployeeData(employee.id, 'startTime', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Godz. zakończenia</Label>
                                <Input
                                  type="time"
                                  value={data.endTime}
                                  onChange={(e) => updateEmployeeData(employee.id, 'endTime', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Przerwa (min)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={data.breakTime}
                                  onChange={(e) => updateEmployeeData(employee.id, 'breakTime', parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {data.type === 'work' && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-700">
                              Liczba godzin pracy: <strong>{calculateHours(employee.id)} h</strong>
                            </p>
                          </div>
                        )}

                        {/* Opis */}
                        <div>
                          <Label>Opis (opcjonalny)</Label>
                          <Textarea
                            value={data.description}
                            onChange={(e) => updateEmployeeData(employee.id, 'description', e.target.value)}
                            placeholder="Dodatkowe informacje..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {selectedProjectId && filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Brak pracowników przypisanych do wybranej budowy
            </div>
          )}

          {!selectedProjectId && (
            <div className="text-center py-8 text-gray-500">
              Wybierz budowę aby zobaczyć listę pracowników
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
