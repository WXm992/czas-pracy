
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence' | 'vacation_on_demand';
}

interface EmployeeTimeData {
  employeeId: string;
  type: TimeEntry['type'];
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
}

interface TimeTrackerProps {
  employees: Employee[];
  projects: Project[];
  currentProjectId: string;
  onSave: (entry: TimeEntry) => void;
  onUpdateEmployeeProject: (employeeId: string, projectId: string | undefined) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  employees,
  projects,
  currentProjectId,
  onSave,
  onUpdateEmployeeProject
}) => {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || '');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [employeeTimeData, setEmployeeTimeData] = useState<Record<string, EmployeeTimeData>>({});

  const entryTypes = [
    { value: 'work', label: 'Praca' },
    { value: 'vacation', label: 'Urlop' },
    { value: 'vacation_on_demand', label: 'Urlop na żądanie' },
    { value: 'sick', label: 'Zwolnienie lekarskie' },
    { value: 'absence', label: 'Nieobecność' }
  ];

  // Pobierz pracowników przypisanych do wybranej budowy
  const projectEmployees = employees.filter(emp => emp.projectId === selectedProjectId);

  // Inicjalizuj dane dla pracowników
  useEffect(() => {
    const initialData: Record<string, EmployeeTimeData> = {};
    projectEmployees.forEach(employee => {
      if (!employeeTimeData[employee.id]) {
        initialData[employee.id] = {
          employeeId: employee.id,
          type: 'work',
          startTime: '08:00',
          endTime: '16:00',
          breakTime: 30,
          description: ''
        };
      }
    });
    setEmployeeTimeData(prev => ({ ...prev, ...initialData }));
  }, [selectedProjectId, projectEmployees.length]);

  const updateEmployeeData = (employeeId: string, field: keyof EmployeeTimeData, value: any) => {
    setEmployeeTimeData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = () => {
    if (!selectedProjectId || !date) {
      toast({
        title: "Błąd",
        description: "Wybierz budowę i datę",
        variant: "destructive"
      });
      return;
    }

    const entries = Object.values(employeeTimeData).filter(data => {
      const employee = employees.find(emp => emp.id === data.employeeId);
      return employee && employee.projectId === selectedProjectId;
    });

    if (entries.length === 0) {
      toast({
        title: "Błąd",
        description: "Brak pracowników do zapisania",
        variant: "destructive"
      });
      return;
    }

    // Walidacja dla wpisów typu "work"
    const workEntries = entries.filter(entry => entry.type === 'work');
    const invalidWorkEntries = workEntries.filter(entry => !entry.startTime || !entry.endTime);

    if (invalidWorkEntries.length > 0) {
      toast({
        title: "Błąd",
        description: "Dla pracy wypełnij godziny rozpoczęcia i zakończenia",
        variant: "destructive"
      });
      return;
    }

    // Zapisz wszystkie wpisy
    entries.forEach(data => {
      const newEntry: TimeEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        employeeId: data.employeeId,
        projectId: selectedProjectId,
        date: format(date, 'yyyy-MM-dd'),
        startTime: data.startTime || '00:00',
        endTime: data.endTime || '00:00',
        breakTime: Number(data.breakTime),
        description: data.description,
        type: data.type,
      };
      onSave(newEntry);
    });

    toast({
      title: "Sukces",
      description: `Zapisano czas pracy dla ${entries.length} pracowników`
    });

    // Reset danych
    const resetData: Record<string, EmployeeTimeData> = {};
    projectEmployees.forEach(employee => {
      resetData[employee.id] = {
        employeeId: employee.id,
        type: 'work',
        startTime: '08:00',
        endTime: '16:00',
        breakTime: 30,
        description: ''
      };
    });
    setEmployeeTimeData(resetData);
  };

  const setAllEmployeesTime = (startTime: string, endTime: string) => {
    const updatedData = { ...employeeTimeData };
    projectEmployees.forEach(employee => {
      if (updatedData[employee.id]) {
        updatedData[employee.id].startTime = startTime;
        updatedData[employee.id].endTime = endTime;
      }
    });
    setEmployeeTimeData(updatedData);
  };

  const setAllEmployeesType = (type: TimeEntry['type']) => {
    const updatedData = { ...employeeTimeData };
    projectEmployees.forEach(employee => {
      if (updatedData[employee.id]) {
        updatedData[employee.id].type = type;
      }
    });
    setEmployeeTimeData(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Wybór budowy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Wybierz budowę
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz budowę" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProjectId && (
        <>
          {/* Globalne ustawienia */}
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia globalne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label>Data *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd") : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Ustaw godziny dla wszystkich</Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        placeholder="Od"
                        onChange={(e) => setAllEmployeesTime(e.target.value, employeeTimeData[projectEmployees[0]?.id]?.endTime || '16:00')}
                      />
                      <Input
                        type="time"
                        placeholder="Do"
                        onChange={(e) => setAllEmployeesTime(employeeTimeData[projectEmployees[0]?.id]?.startTime || '08:00', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Ustaw typ dla wszystkich</Label>
                    <Select onValueChange={(value: TimeEntry['type']) => setAllEmployeesType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz typ" />
                      </SelectTrigger>
                      <SelectContent>
                        {entryTypes.map((entryType) => (
                          <SelectItem key={entryType.value} value={entryType.value}>
                            {entryType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista pracowników */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pracownicy na budowie ({projectEmployees.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectEmployees.length > 0 ? (
                <div className="space-y-4">
                  {projectEmployees.map((employee) => {
                    const employeeData = employeeTimeData[employee.id] || {
                      employeeId: employee.id,
                      type: 'work' as const,
                      startTime: '08:00',
                      endTime: '16:00',
                      breakTime: 30,
                      description: ''
                    };

                    return (
                      <div key={employee.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Typ wpisu</Label>
                            <Select 
                              value={employeeData.type} 
                              onValueChange={(value: TimeEntry['type']) => updateEmployeeData(employee.id, 'type', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {entryTypes.map((entryType) => (
                                  <SelectItem key={entryType.value} value={entryType.value}>
                                    {entryType.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {employeeData.type === 'work' && (
                            <>
                              <div>
                                <Label className="text-xs">Od</Label>
                                <Input
                                  type="time"
                                  value={employeeData.startTime}
                                  onChange={(e) => updateEmployeeData(employee.id, 'startTime', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Do</Label>
                                <Input
                                  type="time"
                                  value={employeeData.endTime}
                                  onChange={(e) => updateEmployeeData(employee.id, 'endTime', e.target.value)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Przerwa (min)</Label>
                                <Input
                                  type="number"
                                  value={employeeData.breakTime.toString()}
                                  onChange={(e) => updateEmployeeData(employee.id, 'breakTime', Number(e.target.value))}
                                  className="h-8"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-3">
                          <Label className="text-xs">Opis</Label>
                          <Textarea
                            value={employeeData.description}
                            onChange={(e) => updateEmployeeData(employee.id, 'description', e.target.value)}
                            placeholder="Dodatkowe informacje"
                            rows={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    );
                  })}

                  <Button onClick={handleSaveAll} className="w-full" size="lg">
                    Zapisz czas pracy dla wszystkich pracowników
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Brak pracowników przypisanych do tej budowy</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Przejdź do zakładki "Przypisania Pracowników", aby dodać pracowników do budowy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TimeTracker;
