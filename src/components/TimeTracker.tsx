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

  const handleSave = () => {
    if (!employeeId || !projectId || !date || !startTime || !endTime) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie pola",
        variant: "destructive"
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      employeeId,
      projectId,
      date: format(date, 'yyyy-MM-dd'),
      startTime,
      endTime,
      breakTime: Number(breakTime),
      description,
      type,
    };

    onSave(newEntry);
    toast({
      title: "Sukces",
      description: "Zapisano nowy wpis"
    });

    setEmployeeId('');
    setDate(undefined);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rejestracja Czasu Pracy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="employee">Pracownik</Label>
            <Select onValueChange={setEmployeeId}>
              <SelectTrigger className="w-full">
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
            <Label htmlFor="project">Budowa</Label>
            <Select onValueChange={setProjectId}>
              <SelectTrigger className="w-full">
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

          <div>
            <Label>Data</Label>
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
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Godzina rozpoczęcia</Label>
              <Input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Godzina zakończenia</Label>
              <Input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="breakTime">Czas przerwy (minuty)</Label>
            <Input
              type="number"
              id="breakTime"
              value={breakTime.toString()}
              onChange={(e) => setBreakTime(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="type">Typ wpisu</Label>
            <Select onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz typ" />
              </SelectTrigger>
              <SelectContent>
                {entryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatkowe informacje"
            />
          </div>

          <Button onClick={handleSave}>Zapisz</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
