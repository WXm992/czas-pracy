import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Users, Clock, Calendar, Calculator, Building, UserCheck, Wrench } from 'lucide-react';
import EmployeeForm from '@/components/EmployeeForm';
import ManagerForm from '@/components/ManagerForm';
import TimeTracker from '@/components/TimeTracker';
import ProjectManager from '@/components/ProjectManager';
import ReportsView from '@/components/ReportsView';
import EquipmentManager from '@/components/EquipmentManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  experience: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  status: 'active' | 'completed' | 'paused';
  managerId: string;
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
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

const Index = () => {
  const { toast } = useToast();
  
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Jan',
      lastName: 'Kowalski',
      position: 'Murarz',
      hourlyRate: 25,
      startDate: '2024-01-15',
      phone: '+48 123 456 789',
      email: 'jan.kowalski@example.com',
      projectId: '1'
    },
    {
      id: '2',
      firstName: 'Anna',
      lastName: 'Nowak',
      position: 'Zbrojarz',
      hourlyRate: 28,
      startDate: '2024-02-01',
      phone: '+48 987 654 321',
      email: 'anna.nowak@example.com',
      projectId: '1'
    }
  ]);

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    {
      id: '1',
      employeeId: '1',
      projectId: '1',
      date: '2024-06-24',
      startTime: '08:00',
      endTime: '16:00',
      breakTime: 30,
      description: 'Budowa muru',
      type: 'work'
    }
  ]);
  
  const [managers, setManagers] = useState<Manager[]>([
    {
      id: '1',
      firstName: 'Piotr',
      lastName: 'Nowak',
      phone: '+48 111 222 333',
      email: 'piotr.nowak@example.com',
      experience: '15 lat doświadczenia w budownictwie'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Dom jednorodzinny - Warszawa',
      location: 'ul. Kwiatowa 15, Warszawa',
      description: 'Budowa domu jednorodzinnego o powierzchni 150m²',
      startDate: '2024-06-01',
      status: 'active',
      managerId: '1'
    }
  ]);

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [editingManager, setEditingManager] = useState<Manager | undefined>();
  const [selectedProject, setSelectedProject] = useState<string>('');

  const [equipment, setEquipment] = useState([]);
  const [managerAssignments, setManagerAssignments] = useState([]);

  const handleSaveEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === employee.id ? employee : emp));
    } else {
      setEmployees(prev => [...prev, employee]);
    }
    setShowEmployeeForm(false);
    setEditingEmployee(undefined);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setTimeEntries(prev => prev.filter(entry => entry.employeeId !== employeeId));
  };

  // Enhanced function to handle manager-project assignments
  const handleSaveManager = async (manager: Manager) => {
    try {
      if (editingManager) {
        setManagers(prev => prev.map(mgr => mgr.id === manager.id ? manager : mgr));
      } else {
        setManagers(prev => [...prev, manager]);
      }
      setShowManagerForm(false);
      setEditingManager(undefined);
    } catch (error) {
      console.error('Error saving manager:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać kierownika",
        variant: "destructive"
      });
    }
  };

  const handleEditManager = (manager: Manager) => {
    setEditingManager(manager);
    setShowManagerForm(true);
  };

  const handleDeleteManager = (managerId: string) => {
    setManagers(prev => prev.filter(mgr => mgr.id !== managerId));
    setProjects(prev => prev.filter(project => project.managerId !== managerId));
  };

  // Enhanced function to handle project creation with manager assignments
  const handleSaveProject = async (project: Project) => {
    try {
      const existingProject = projects.find(p => p.id === project.id);
      if (existingProject) {
        setProjects(prev => prev.map(p => p.id === project.id ? project : p));
      } else {
        setProjects(prev => [...prev, project]);
      }

      // Create manager-project assignment in database
      if (project.managerId) {
        const { error } = await supabase
          .from('manager_project_assignments')
          .upsert({
            manager_id: project.managerId,
            project_id: project.id,
            is_active: true
          });

        if (error) {
          console.error('Error creating manager assignment:', error);
        }
      }

      toast({
        title: "Sukces",
        description: existingProject ? "Budowa została zaktualizowana" : "Budowa została dodana"
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać budowy",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setEmployees(prev => prev.map(emp => 
      emp.projectId === projectId ? { ...emp, projectId: undefined } : emp
    ));
    setTimeEntries(prev => prev.filter(entry => entry.projectId !== projectId));
  };

  const handleSaveTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => [...prev, entry]);
  };

  const getProjectEmployees = (projectId: string) => {
    return employees.filter(emp => emp.projectId === projectId);
  };

  const getProjectTimeEntries = (projectId: string) => {
    return timeEntries.filter(entry => entry.projectId === projectId);
  };

  const stats = [
    {
      title: 'Aktywne Budowy',
      value: projects.filter(p => p.status === 'active').length.toString(),
      icon: Building,
      color: 'bg-blue-500'
    },
    {
      title: 'Kierownicy',
      value: managers.length.toString(),
      icon: UserCheck,
      color: 'bg-purple-500'
    },
    {
      title: 'Aktywni Pracownicy',
      value: employees.length.toString(),
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Wpisy Dzisiaj',
      value: timeEntries.filter(entry => 
        entry.date === new Date().toISOString().split('T')[0]
      ).length.toString(),
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  if (showEmployeeForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <EmployeeForm
            employee={editingEmployee}
            projects={projects.filter(p => p.status === 'active')}
            onSave={handleSaveEmployee}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  if (showManagerForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ManagerForm
            manager={editingManager}
            onSave={handleSaveManager}
            onCancel={() => {
              setShowManagerForm(false);
              setEditingManager(undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Zarządzania Budową
          </h1>
          <p className="text-gray-600">
            Kompleksowe zarządzanie czasem pracy dla firm budowlanych
          </p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Główna zawartość */}
        <Tabs defaultValue="timetracking" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="timetracking">Czas Pracy</TabsTrigger>
            <TabsTrigger value="projects">Budowy</TabsTrigger>
            <TabsTrigger value="managers">Kierownicy</TabsTrigger>
            <TabsTrigger value="employees">Pracownicy</TabsTrigger>
            <TabsTrigger value="equipment">Sprzęt</TabsTrigger>
            <TabsTrigger value="reports">Raporty</TabsTrigger>
          </TabsList>

          <TabsContent value="timetracking">
            <div className="space-y-6">
              {projects.filter(p => p.status === 'active').length > 0 && (
                <div className="mb-4">
                  <Label htmlFor="projectFilter">Filtruj według budowy:</Label>
                  <select
                    id="projectFilter"
                    className="w-full max-w-md p-2 border border-gray-300 rounded-md mt-1"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">Wszystkie budowy</option>
                    {projects.filter(p => p.status === 'active').map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <TimeTracker
                employees={employees}
                projects={projects.filter(p => p.status === 'active')}
                currentProjectId={selectedProject}
                onSave={handleSaveTimeEntry}
              />
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager
              projects={projects}
              managers={managers}
              onSave={handleSaveProject}
              onEdit={handleSaveProject}
              onDelete={handleDeleteProject}
            />
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Kierownicy Budowy</h2>
              <Button onClick={() => setShowManagerForm(true)}>
                <UserCheck className="w-4 h-4 mr-2" />
                Dodaj Kierownika
              </Button>
            </div>
            
            <div className="grid gap-4">
              {managers.map(manager => (
                <Card key={manager.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {manager.firstName} {manager.lastName}
                        </h3>
                        <p className="text-gray-600 mb-1">Tel: {manager.phone}</p>
                        <p className="text-gray-600 mb-1">Email: {manager.email}</p>
                        <p className="text-gray-600">{manager.experience}</p>
                        <p className="text-sm text-blue-600 mt-2">
                          Budowy: {projects.filter(p => p.managerId === manager.id).length}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditManager(manager)}
                        >
                          Edytuj
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteManager(manager.id)}
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Zarządzanie Pracownikami</h2>
              <Button onClick={() => setShowEmployeeForm(true)}>
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
                          onClick={() => handleEditEmployee(employee)}
                        >
                          Edytuj
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Usuń
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="equipment">
            <EquipmentManager />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsView
              employees={employees}
              timeEntries={timeEntries}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
