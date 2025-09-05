import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, UserCheck } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  projectIds?: string[]; // Changed to support multiple projects
}

interface Project {
  id: string;
  name: string;
  status: string;
}

interface QuickEmployeeManagerProps {
  employees: Employee[];
  projects: Project[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployeeProjects: (employeeId: string, projectIds: string[]) => void;
}

const QuickEmployeeManager: React.FC<QuickEmployeeManagerProps> = ({
  employees,
  projects,
  onAddEmployee,
  onUpdateEmployeeProjects
}) => {
  const { toast } = useToast();
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    position: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeProjects, setEmployeeProjects] = useState<string[]>([]);

  const activeProjects = projects.filter(p => p.status === 'active');
  
  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update employee projects when selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEmployeeProjects(selectedEmployee.projectIds || []);
    }
  }, [selectedEmployee]);

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.position) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie pola pracownika",
        variant: "destructive"
      });
      return;
    }

    onAddEmployee({
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      position: newEmployee.position,
      projectIds: []
    });

    // Reset form
    setNewEmployee({
      firstName: '',
      lastName: '',
      position: ''
    });

    toast({
      title: "Sukces",
      description: "Pracownik został dodany"
    });
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    const newProjectIds = checked 
      ? [...employeeProjects, projectId]
      : employeeProjects.filter(id => id !== projectId);
    
    setEmployeeProjects(newProjectIds);
    
    if (selectedEmployee) {
      onUpdateEmployeeProjects(selectedEmployee.id, newProjectIds);
    }
  };

  const getEmployeeProjectNames = (employee: Employee) => {
    if (!employee.projectIds || employee.projectIds.length === 0) return 'Brak przypisań';
    return employee.projectIds
      .map(pid => projects.find(p => p.id === pid)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Employee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Szybkie dodawanie pracownika
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Imię"
              value={newEmployee.firstName}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              placeholder="Nazwisko"
              value={newEmployee.lastName}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
            />
            <Input
              placeholder="Stanowisko"
              value={newEmployee.position}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, position: e.target.value }))}
            />
            <Button onClick={handleAddEmployee} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Dodaj
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Search & Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Wyszukaj i przypisz pracownika
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Szukaj pracownika po imieniu, nazwisku lub stanowisku..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedEmployee?.id === employee.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-500">{employee.position}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {getEmployeeProjectNames(employee)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  Nie znaleziono pracowników
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Assignment */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Przypisania do budów: {selectedEmployee.firstName} {selectedEmployee.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Zaznacz budowy, na które pracownik może być przypisany (można wybrać kilka):
              </div>
              
              {activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeProjects.map(project => (
                    <div key={project.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={employeeProjects.includes(project.id)}
                        onCheckedChange={(checked) => handleProjectToggle(project.id, checked as boolean)}
                      />
                      <label 
                        htmlFor={`project-${project.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {project.name}
                      </label>
                      {employeeProjects.includes(project.id) && (
                        <Badge variant="secondary" className="text-xs">
                          Przypisany
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Brak aktywnych budów
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Obecne przypisania:</strong> {getEmployeeProjectNames(selectedEmployee)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Employees Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Wszyscy pracownicy ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="space-y-2">
              {employees.map(employee => (
                <div 
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div>
                    <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {getEmployeeProjectNames(employee)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Brak pracowników. Dodaj pierwszego pracownika powyżej.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickEmployeeManager;