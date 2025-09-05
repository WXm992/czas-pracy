
import React from 'react';
import WorkerTimeList from '@/components/WorkerTimeList';

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
      <WorkerTimeList
        employees={employees}
        projects={activeProjects}
        selectedProject={selectedProject}
        onProjectChange={onProjectChange}
        onAddEmployee={onAddEmployee}
        onUpdateEmployeeProjects={onUpdateEmployeeProjects}
      />
    </div>
  );
};

export default TimeTrackingTab;
