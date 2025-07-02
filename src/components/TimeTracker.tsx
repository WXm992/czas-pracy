
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence' | 'vacation_on_demand' | 'l4';
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
  type: 'work' | 'vacation' | 'sick' | 'absence' | 'vacation_on_demand' | 'l4';
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ employees, projects, currentProjectId, onSave }) => {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  
  // Stan dla każdego pracownika
  const [employeesData, setEmployeesData] = useState<Record<string, EmployeeTimeData>>({});

  // Filter employees by selected project and search term
  const filteredEmployees = useMemo(() => {
    let filtered = selectedProjectId 
      ? employees.filter(emp => emp.projectId === selectedProjectId)
      : employees;
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [employees, selectedProjectId, searchTerm]);

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

  const handleEmployeeSelection = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  const handleBulkTypeChange = (type: EmployeeTimeData['type']) => {
    selectedEmployees.forEach(employeeId => {
      updateEmployeeData(employeeId, 'type', type);
    });
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
      return data.type !== 'work' || data.startTime !== '08:00' || data.endTime !== '16:00';
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

    setEmployeesData({});
    setSelectedEmployees(new Set());
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

    setEmployeesData(prev => {
      const newData = { ...prev };
      delete newData[employeeId];
      return newData;
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'work':
        return 'Praca';
      case 'vacation':
        return 'Urlop';
      case 'vacation_on_demand':
        return 'Urlop na żądanie';
      case 'sick':
        return 'Zwolnienie lekarskie';
      case 'l4':
        return 'L4';
      case 'absence':
        return 'Nieobecność';
      default:
        return type;
    }
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
            {!currentProjectId && (
              <div>
                <Label htmlFor="project">Budowa *</Label>
                <select
                  id="project"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setEmployeesData({});
                    setSelectedEmployees(new Set());
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
          </div>

          {/* Wyszukiwanie i operacje masowe */}
          {selectedProjectId && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Wyszukaj pracownika</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Wpisz imię lub nazwisko..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {selectedEmployees.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkTypeChange('vacation')}
                    >
                      Urlop ({selectedEmployees.size})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkTypeChange('vacation_on_demand')}
                    >
                      Urlop na żądanie
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkTypeChange('sick')}
                    >
                      Zwolnienie
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkTypeChange('l4')}
                    >
                      L4
                    </Button>
                  </div>
                )}
              </div>

              {filteredEmployees.length > 0 && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all">
                      Zaznacz wszystkich ({filteredEmployees.length})
                    </Label>
                  </div>
                  <Button onClick={handleSaveAll} className="bg-green-600 hover:bg-green-700">
                    Zapisz Wszystkich
                  </Button>
                </div>
              )}

              {/* Lista pracowników */}
              <div className="space-y-4">
                {filteredEmployees.map(employee => {
                  const data = getEmployeeData(employee.id);
                  const isSelected = selectedEmployees.has(employee.id);
                  return (
                    <Card key={employee.id} className={`p-4 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleEmployeeSelection(employee.id, checked as boolean)}
                            />
                            <h4 className="text-md font-medium">
                              {employee.firstName} {employee.lastName}
                            </h4>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleSaveEmployee(employee.id)}
                            variant={isSelected ? "default" : "outline"}
                          >
                            Zapisz
                          </Button>
                        </div>

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
                              <option value="vacation_on_demand">Urlop na żądanie</option>
                              <option value="sick">Zwolnienie lekarskie</option>
                              <option value="l4">L4</option>
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

                        {data.type !== 'work' && (
                          <div className="bg-yellow-50 p-3 rounded-md">
                            <p className="text-sm text-yellow-700">
                              Typ wpisu: <strong>{getTypeLabel(data.type)}</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {selectedProjectId && filteredEmployees.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              Nie znaleziono pracowników pasujących do wyszukiwania "{searchTerm}"
            </div>
          )}

          {selectedProjectId && filteredEmployees.length === 0 && !searchTerm && (
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
