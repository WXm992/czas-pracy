import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock, Users, Plus, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { timeTrackingApi, TimeTrackingEntry } from '@/lib/api';

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

interface WorkerTimeListProps {
  employees: Employee[];
  projects: Project[];
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
}

interface WorkerEntry {
  employeeId: string;
  employeeName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  notes: string;
  absenceType: 'work' | 'vacation' | 'sick_leave' | 'unpaid_leave' | 'absence';
  isPresent: boolean;
}

const WorkerTimeList: React.FC<WorkerTimeListProps> = ({
  employees,
  projects,
  selectedProject,
  onProjectChange
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeTrackingEntry[]>([]);
  const [workerEntries, setWorkerEntries] = useState<WorkerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const activeProjects = projects.filter(p => p.name); // Filter active projects
  const projectEmployees = employees.filter(emp => emp.projectId === selectedProject);

  const absenceTypes = [
    { value: 'work', label: 'Praca', color: 'bg-green-100 text-green-800' },
    { value: 'vacation', label: 'Urlop', color: 'bg-blue-100 text-blue-800' },
    { value: 'sick_leave', label: 'L4 (Zwolnienie)', color: 'bg-red-100 text-red-800' },
    { value: 'unpaid_leave', label: 'NŻ (Nieobecność)', color: 'bg-orange-100 text-orange-800' },
    { value: 'absence', label: 'Nieobecny', color: 'bg-gray-100 text-gray-800' }
  ];

  // Load existing time entries for the selected date and project
  const loadTimeEntries = async () => {
    if (!selectedProject || !selectedDate) return;
    
    setLoading(true);
    try {
      const entries = await timeTrackingApi.getAll(selectedProject);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const filteredEntries = entries.filter(entry => entry.workDate === dateString);
      setTimeEntries(filteredEntries);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować wpisów czasu pracy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize worker entries for the selected date
  useEffect(() => {
    if (!selectedDate || !selectedProject) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const newEntries: WorkerEntry[] = projectEmployees.map(employee => {
      const existingEntry = timeEntries.find(entry => entry.employeeId === employee.id);
      
      return {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        workDate: dateString,
        startTime: existingEntry?.startTime || '08:00',
        endTime: existingEntry?.endTime || '16:00',
        notes: existingEntry?.notes || '',
        absenceType: existingEntry?.absenceType || 'work',
        isPresent: existingEntry?.isPresent ?? true
      };
    });
    
    setWorkerEntries(newEntries);
  }, [selectedDate, selectedProject, projectEmployees, timeEntries]);

  useEffect(() => {
    loadTimeEntries();
  }, [selectedProject, selectedDate]);

  const updateWorkerEntry = (employeeId: string, field: keyof WorkerEntry, value: any) => {
    setWorkerEntries(prev => 
      prev.map(entry => 
        entry.employeeId === employeeId 
          ? { ...entry, [field]: value }
          : entry
      )
    );
  };

  const saveTimeEntries = async () => {
    if (!selectedProject || !selectedDate) {
      toast({
        title: "Błąd",
        description: "Wybierz budowę i datę",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      for (const entry of workerEntries) {
        const existingEntry = timeEntries.find(te => te.employeeId === entry.employeeId);
        
        const entryData = {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          projectId: selectedProject,
          workDate: entry.workDate,
          startTime: entry.absenceType === 'work' ? entry.startTime : undefined,
          endTime: entry.absenceType === 'work' ? entry.endTime : undefined,
          notes: entry.notes,
          absenceType: entry.absenceType,
          isPresent: entry.absenceType === 'work',
        };

        if (existingEntry) {
          await timeTrackingApi.update(existingEntry.id, entryData);
        } else {
          await timeTrackingApi.create(entryData);
        }
      }

      await loadTimeEntries(); // Reload to get latest data
      
      toast({
        title: "Sukces",
        description: `Zapisano czas pracy dla ${workerEntries.length} pracowników`
      });
    } catch (error) {
      console.error('Error saving time entries:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać wpisów czasu pracy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAbsenceTypeInfo = (type: string) => {
    return absenceTypes.find(at => at.value === type) || absenceTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Project and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Lista pracowników na budowie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Budowa</label>
              <Select value={selectedProject} onValueChange={onProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz budowę" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "yyyy-MM-dd") : <span>Wybierz datę</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProject && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pracownicy ({workerEntries.length})
              </div>
              <Button 
                onClick={saveTimeEntries} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Zapisz
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Ładowanie...</div>
            ) : workerEntries.length > 0 ? (
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded">
                  <div className="col-span-3">Pracownik</div>
                  <div className="col-span-1">Dzień</div>
                  <div className="col-span-2">Start - Koniec</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-4">Notatka</div>
                </div>
                
                {/* Worker entries */}
                {workerEntries.map((entry) => {
                  const absenceInfo = getAbsenceTypeInfo(entry.absenceType);
                  const employee = projectEmployees.find(emp => emp.id === entry.employeeId);
                  
                  return (
                    <div key={entry.employeeId} className="grid grid-cols-12 gap-2 items-center bg-white p-3 border rounded hover:bg-gray-50">
                      <div className="col-span-3">
                        <div className="font-medium">{entry.employeeName}</div>
                        <div className="text-sm text-gray-500">{employee?.position}</div>
                      </div>
                      
                      <div className="col-span-1 text-sm text-gray-600">
                        {format(selectedDate, "dd/MM")}
                      </div>
                      
                      <div className="col-span-2 space-y-1">
                        {entry.absenceType === 'work' ? (
                          <div className="flex gap-1">
                            <Input
                              type="time"
                              value={entry.startTime}
                              onChange={(e) => updateWorkerEntry(entry.employeeId, 'startTime', e.target.value)}
                              className="h-8 text-xs"
                            />
                            <span className="text-gray-400 self-center">-</span>
                            <Input
                              type="time"
                              value={entry.endTime}
                              onChange={(e) => updateWorkerEntry(entry.employeeId, 'endTime', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 py-1">N/A</div>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <Select 
                          value={entry.absenceType} 
                          onValueChange={(value: any) => updateWorkerEntry(entry.employeeId, 'absenceType', value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue>
                              <span className={`px-2 py-1 rounded text-xs ${absenceInfo.color}`}>
                                {absenceInfo.label}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {absenceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <span className={`px-2 py-1 rounded text-xs ${type.color}`}>
                                  {type.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-4">
                        <Textarea
                          value={entry.notes}
                          onChange={(e) => updateWorkerEntry(entry.employeeId, 'notes', e.target.value)}
                          placeholder="Notatka..."
                          className="h-8 text-xs resize-none"
                          rows={1}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Brak pracowników przypisanych do tej budowy</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkerTimeList;