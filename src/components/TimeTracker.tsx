
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
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  description: string;
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

interface TimeTrackerProps {
  employees: Array<{ id: string; firstName: string; lastName: string }>;
  onSave: (entry: TimeEntry) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ employees, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    breakTime: 30,
    description: '',
    type: 'work' as 'work' | 'vacation' | 'sick' | 'absence'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.date) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać pracownika i datę",
        variant: "destructive"
      });
      return;
    }

    const entry: TimeEntry = {
      id: Date.now().toString(),
      ...formData,
    };

    onSave(entry);
    
    toast({
      title: "Sukces",
      description: "Czas pracy został zarejestrowany"
    });

    // Reset form
    setFormData({
      ...formData,
      description: ''
    });
  };

  const calculateHours = () => {
    if (formData.startTime && formData.endTime && formData.type === 'work') {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const workHours = Math.max(0, diffHours - (formData.breakTime / 60));
      return workHours.toFixed(2);
    }
    return '0.00';
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Rejestracja Czasu Pracy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Pracownik *</Label>
              <select
                id="employee"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
              >
                <option value="">Wybierz pracownika</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Typ wpisu</Label>
            <select
              id="type"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="work">Praca</option>
              <option value="vacation">Urlop</option>
              <option value="sick">Zwolnienie lekarskie</option>
              <option value="absence">Nieobecność</option>
            </select>
          </div>

          {formData.type === 'work' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startTime">Godzina rozpoczęcia</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Godzina zakończenia</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="breakTime">Przerwa (minuty)</Label>
                  <Input
                    id="breakTime"
                    type="number"
                    min="0"
                    value={formData.breakTime}
                    onChange={(e) => setFormData({ ...formData, breakTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">
                  Liczba godzin pracy: <strong>{calculateHours()} h</strong>
                </p>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="description">Opis (opcjonalny)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Dodatkowe informacje o pracy lub nieobecności"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full">
            Zapisz Wpis
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
