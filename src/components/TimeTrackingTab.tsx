
import React from 'react';
import WorkerTimeList from '@/components/WorkerTimeList';
import EmployeeProjectManager from '@/components/EmployeeProjectManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeTrackingTabProps {
  projects: Array<{ id: string; name: string; status: string }>;
  employees: Array<any>;
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  onSaveTimeEntry: (entry: any) => void;
  onUpdateEmployeeProject: (employeeId: string, projectId: string | undefined) => void;
}

const TimeTrackingTab: React.FC<TimeTrackingTabProps> = ({
  projects,
  employees,
  selectedProject,
  onProjectChange,
  onSaveTimeEntry,
  onUpdateEmployeeProject
}) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="worker-list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="worker-list">Lista Pracowników</TabsTrigger>
          <TabsTrigger value="manage-assignments">Przypisania Pracowników</TabsTrigger>
        </TabsList>

        <TabsContent value="worker-list" className="space-y-4">
          <WorkerTimeList
            employees={employees}
            projects={activeProjects}
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
          />
        </TabsContent>

        <TabsContent value="manage-assignments" className="space-y-4">
          {selectedProject ? (
            <EmployeeProjectManager
              employees={employees}
              selectedProjectId={selectedProject}
              onUpdateEmployeeProject={onUpdateEmployeeProject}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Wybierz budowę, aby zarządzać przypisaniami pracowników</p>
              <select
                className="p-2 border border-gray-300 rounded-md"
                value={selectedProject}
                onChange={(e) => onProjectChange(e.target.value)}
              >
                <option value="">Wybierz budowę</option>
                {activeProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTrackingTab;
