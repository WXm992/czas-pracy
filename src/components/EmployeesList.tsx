
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate: number;
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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie Pracownikami</h2>
        <Button onClick={onAddEmployee}>
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
                  {employee.projectId && (
                    <p className="text-sm text-blue-600 mt-2">
                      Budowa: {projects.find(p => p.id === employee.projectId)?.name}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onEditEmployee(employee)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDeleteEmployee(employee.id)}
                  >
                    Usuń
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeesList;
