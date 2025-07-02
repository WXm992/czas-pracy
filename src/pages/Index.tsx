import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeForm from '@/components/EmployeeForm';
import ManagerForm from '@/components/ManagerForm';
import ProjectManager from '@/components/ProjectManager';
import ReportsView from '@/components/ReportsView';
import EquipmentManager from '@/components/EquipmentManager';
import StatsCards from '@/components/StatsCards';
import ManagersList from '@/components/ManagersList';
import EmployeesList from '@/components/EmployeesList';
import TimeTrackingTab from '@/components/TimeTrackingTab';
import ManagerAssignments from '@/components/ManagerAssignments';
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
  const [managerAssignments, setManagerAssignments] = useState<Array<{managerId: string; projectId: string}>>([
    { managerId: '1', projectId: '1' }
  ]);

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

  const handleSaveProject = async (project: Project) => {
    try {
      const existingProject = projects.find(p => p.id === project.id);
      if (existingProject) {
        setProjects(prev => prev.map(p => p.id === project.id ? project : p));
      } else {
        setProjects(prev => [...prev, project]);
      }

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

  const handleUpdateManagerAssignments = (assignments: Array<{managerId: string; projectId: string}>) => {
    setManagerAssignments(assignments);
  };

  const handleUpdateEmployeeProject = (employeeId: string, projectId: string | undefined) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, projectId } : emp
    ));
  };

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

        <StatsCards
          projects={projects}
          managers={managers}
          employees={employees}
          timeEntries={timeEntries}
        />

        <Tabs defaultValue="timetracking" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="timetracking">Czas Pracy</TabsTrigger>
            <TabsTrigger value="projects">Budowy</TabsTrigger>
            <TabsTrigger value="managers">Kierownicy</TabsTrigger>
            <TabsTrigger value="manager-assignments">Przypisania</TabsTrigger>
            <TabsTrigger value="employees">Pracownicy</TabsTrigger>
            <TabsTrigger value="equipment">Sprzęt</TabsTrigger>
            <TabsTrigger value="reports">Raporty</TabsTrigger>
          </TabsList>

          <TabsContent value="timetracking">
            <TimeTrackingTab
              projects={projects}
              employees={employees}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
              onSaveTimeEntry={handleSaveTimeEntry}
              onUpdateEmployeeProject={handleUpdateEmployeeProject}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager
              projects={projects}
              managers={managers}
              assignments={managerAssignments}
              onSave={handleSaveProject}
              onEdit={handleSaveProject}
              onDelete={handleDeleteProject}
              onUpdateAssignments={handleUpdateManagerAssignments}
            />
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <ManagersList
              managers={managers}
              projects={projects}
              onAddManager={() => setShowManagerForm(true)}
              onEditManager={handleEditManager}
              onDeleteManager={handleDeleteManager}
            />
          </TabsContent>

          <TabsContent value="manager-assignments">
            <ManagerAssignments
              managers={managers}
              projects={projects}
              assignments={managerAssignments}
              onUpdateAssignments={handleUpdateManagerAssignments}
            />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeesList
              employees={employees}
              projects={projects}
              onAddEmployee={() => setShowEmployeeForm(true)}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
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
