
import React from 'react';
import { Label } from '@/components/ui/label';
import TimeTracker from '@/components/TimeTracker';

interface TimeTrackingTabProps {
  projects: Array<{ id: string; name: string; status: string }>;
  employees: Array<any>;
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
  onSaveTimeEntry: (entry: any) => void;
}

const TimeTrackingTab: React.FC<TimeTrackingTabProps> = ({
  projects,
  employees,
  selectedProject,
  onProjectChange,
  onSaveTimeEntry
}) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      {activeProjects.length > 0 && (
        <div className="mb-4">
          <Label htmlFor="projectFilter">Filtruj według budowy:</Label>
          <select
            id="projectFilter"
            className="w-full max-w-md p-2 border border-gray-300 rounded-md mt-1"
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">Wszystkie budowy</option>
            {activeProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <TimeTracker
        employees={employees}
        projects={activeProjects}
        currentProjectId={selectedProject}
        onSave={onSaveTimeEntry}
      />
    </div>
  );
};

export default TimeTrackingTab;
