
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
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
  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState(currentProjectId || '');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakTime, setBreakTime] = useState(0);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TimeEntry['type']>('work');

  useEffect(() => {
    if (currentProjectId) {
      setProjectId(currentProjectId);
    }
  }, [currentProjectId]);

  // Zapamiętaj ostatnie przypisanie pracownika do budowy
  useEffect(() => {
    if (employeeId && projectId) {
      const key = `employee-${employeeId}-last-project`;
      localStorage.setItem(key, projectId);
      onUpdateEmployeeProject(employeeId, projectId);
    }
  }, [employeeId, projectId, onUpdateEmployeeProject]);

  // Przywróć ostatnią budowę dla wybranego pracownika
  useEffect(() => {
    if (employeeId) {
      const key = `employee-${employeeId}-last-project`;
      const lastProject = localStorage.getItem(key);
      if (lastProject && projects.find(p => p.id === lastProject)) {
        setProjectId(lastProject);
      }
    }
  }, [employeeId, projects]);

  const handleSave = () => {
    if (!employeeId || !date) {
      toast({
        title: "Błąd",
        description: "Wybierz pracownika i datę",
        variant: "destructive"
      });
      return;
    }

    // Dla typu "work" wymagamy więcej danych
    if (type === 'work' && (!projectId || !startTime || !endTime)) {
      toast({
        title: "Błąd",
        description: "Dla pracy wypełnij wszystkie pola",
        variant: "destructive"
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      employeeId,
      projectId: projectId || '',
      date: format(date, 'yyyy-MM-dd'),
      startTime: startTime || '00:00',
      endTime: endTime || '00:00',
      breakTime: Number(breakTime),
      description,
      type,
    };

    onSave(newEntry);
    toast({
      title: "Sukces",
      description: "Zapisano wpis"
    });

    // Reset formularza - zachowaj pracownika i budowę
    setDate(new Date());
    setStartTime('');
    setEndTime('');
    setBreakTime(0);
    setDescription('');
    setType('work');
  };

  const entryTypes = [
    { value: 'work', label: 'Praca' },
    { value: 'vacation', label: 'Urlop' },
    { value: 'vacation_on_demand', label: 'Urlop na żądanie' },
    { value: 'sick', label: 'Zwolnienie lekarskie' },
    { value: 'absence', label: 'Nieobecność' }
  ];

  const isWorkType = type === 'work';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Dodaj Czas Pracy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Podstawowe informacje - zawsze widoczne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Pracownik *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz pracownika" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Typ wpisu *</Label>
              <Select value={type} onValueChange={(value: TimeEntry['type']) => setType(value)}>
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

          {/* Szczegóły pracy - tylko dla typu "work" */}
          {isWorkType && (
            <>
              <div>
                <Label htmlFor="project">Budowa *</Label>
                <Select value={projectId} onValueChange={setProjectId}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Od *</Label>
                  <Input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Do *</Label>
                  <Input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="breakTime">Przerwa (minuty)</Label>
                <Input
                  type="number"
                  id="breakTime"
                  value={breakTime.toString()}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatkowe informacje"
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Zapisz wpis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
