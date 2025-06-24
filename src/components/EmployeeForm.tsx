
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate: number;
  startDate: string;
  phone: string;
  email: string;
  projectId?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  projects?: Array<{ id: string; name: string; status: string }>;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, projects = [], onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Employee>({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    position: employee?.position || '',
    hourlyRate: employee?.hourlyRate || 0,
    startDate: employee?.startDate || new Date().toISOString().split('T')[0],
    phone: employee?.phone || '',
    email: employee?.email || '',
    projectId: employee?.projectId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.position) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    onSave({
      ...formData,
      id: employee?.id || Date.now().toString()
    });

    toast({
      title: "Sukces",
      description: employee ? "Pracownik został zaktualizowany" : "Pracownik został dodany"
    });
  };

  const handleChange = (field: keyof Employee, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {employee ? 'Edytuj Pracownika' : 'Dodaj Nowego Pracownika'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="position">Stanowisko *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              placeholder="np. Murarz, Zbrojarz, Operator koparki"
              required
            />
          </div>

          {activeProjects.length > 0 && (
            <div>
              <Label htmlFor="projectId">Budowa</Label>
              <select
                id="projectId"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
              >
                <option value="">Nie przypisany do budowy</option>
                {activeProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Stawka godzinowa (zł)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate}
                onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Data zatrudnienia</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+48 123 456 789"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
            <Button type="submit">
              {employee ? 'Zaktualizuj' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
