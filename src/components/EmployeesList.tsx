import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import EmployeeCredentials from './EmployeeCredentials';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate: number;
  startDate: string;
  phone: string;
  email: string;
  projectId?: string;
}

interface Project {
  id: string;
  name: string;
}

interface EmployeesListProps {
  employees: Employee[];
  projects: Project[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const EmployeesList: React.FC<EmployeesListProps> = ({
  employees,
  projects,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCredentials, setShowCredentials] = useState<string | null>(null);

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectName = (projectId: string | undefined) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Brak';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie Pracownikami</h2>
        <Button onClick={onAddEmployee}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj Pracownika
        </Button>
      </div>

      <div>
        <Label htmlFor="employee-search">Wyszukaj pracowników</Label>
        <Input
          id="employee-search"
          type="text"
          placeholder="Wpisz imię, nazwisko lub stanowisko..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredEmployees.map(employee => (
          <Card key={employee.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Stanowisko:</strong> {employee.position}</p>
                    <p><strong>Stawka godzinowa:</strong> {employee.hourlyRate} zł</p>
                    <p><strong>Data rozpoczęcia:</strong> {new Date(employee.startDate).toLocaleDateString('pl-PL')}</p>
                    <p><strong>Telefon:</strong> {employee.phone}</p>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Budowa:</strong> {getProjectName(employee.projectId)}</p>
                  </div>
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCredentials(showCredentials === employee.id ? null : employee.id)}
                  >
                    Uprawnienia
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onEditEmployee(employee)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń
                  </Button>
                </div>
              </div>
              
              {showCredentials === employee.id && (
                <div className="mt-4 pt-4 border-t">
                  <EmployeeCredentials
                    employeeId={employee.id}
                    employeeName={`${employee.firstName} ${employee.lastName}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredEmployees.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Brak pracowników. Dodaj pierwszego pracownika, aby rozpocząć.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmployeesList;
