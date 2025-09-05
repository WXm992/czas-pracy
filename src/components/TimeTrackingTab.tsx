
import React from 'react';
import WorkerTimeList from '@/components/WorkerTimeList';
import QuickEmployeeManager from '@/components/QuickEmployeeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeTrackingTabProps {
  projects: Array<{ id: string; name: string; status: string }>;
  employees: Array<any>;
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  onSaveTimeEntry: (entry: any) => void;
  onAddEmployee: (employee: any) => void;
  onUpdateEmployeeProjects: (employeeId: string, projectIds: string[]) => void;
}

const TimeTrackingTab: React.FC<TimeTrackingTabProps> = ({
  projects,
  employees,
  selectedProject,
  onProjectChange,
  onSaveTimeEntry,
  onAddEmployee,
  onUpdateEmployeeProjects
}) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="worker-list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="worker-list">Lista Pracowników</TabsTrigger>
          <TabsTrigger value="manage-employees">Zarządzanie Pracownikami</TabsTrigger>
        </TabsList>

        <TabsContent value="worker-list" className="space-y-4">
          <WorkerTimeList
            employees={employees}
            projects={activeProjects}
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
          />
        </TabsContent>

        <TabsContent value="manage-employees" className="space-y-4">
          <QuickEmployeeManager
            employees={employees}
            projects={projects}
            onAddEmployee={onAddEmployee}
            onUpdateEmployeeProjects={onUpdateEmployeeProjects}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTrackingTab;
