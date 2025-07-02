
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Users } from 'lucide-react';

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
  status: string;
  managerId?: string;
}

interface ManagerAssignment {
  managerId: string;
  projectId: string;
}

interface ManagerAssignmentsProps {
  managers: Manager[];
  projects: Project[];
  assignments: ManagerAssignment[];
  onUpdateAssignments: (assignments: ManagerAssignment[]) => void;
}

const ManagerAssignments: React.FC<ManagerAssignmentsProps> = ({
  managers,
  projects,
  assignments,
  onUpdateAssignments
}) => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedManagers, setSelectedManagers] = useState<Set<string>>(new Set());

  const getProjectManagers = (projectId: string) => {
    return assignments
      .filter(a => a.projectId === projectId)
      .map(a => managers.find(m => m.id === a.managerId))
      .filter(Boolean);
  };

  const isManagerAssigned = (managerId: string, projectId: string) => {
    return assignments.some(a => a.managerId === managerId && a.projectId === projectId);
  };

  const handleManagerSelection = (managerId: string, projectId: string, assigned: boolean) => {
    let newAssignments = [...assignments];
    
    if (assigned) {
      // Dodaj przypisanie
      newAssignments.push({ managerId, projectId });
    } else {
      // Usuń przypisanie
      newAssignments = newAssignments.filter(
        a => !(a.managerId === managerId && a.projectId === projectId)
      );
    }
    
    onUpdateAssignments(newAssignments);
    
    const manager = managers.find(m => m.id === managerId);
    const project = projects.find(p => p.id === projectId);
    
    toast({
      title: assigned ? "Przypisano kierownika" : "Usunięto przypisanie",
      description: `${manager?.firstName} ${manager?.lastName} ${assigned ? 'został przypisany do' : 'został usunięty z'} ${project?.name}`
    });
  };

  const handleBulkAssignment = () => {
    if (!selectedProject || selectedManagers.size === 0) {
      toast({
        title: "Błąd",
        description: "Wybierz budowę i przynajmniej jednego kierownika",
        variant: "destructive"
      });
      return;
    }

    let newAssignments = [...assignments];
    const project = projects.find(p => p.id === selectedProject);
    
    selectedManagers.forEach(managerId => {
      if (!isManagerAssigned(managerId, selectedProject)) {
        newAssignments.push({ managerId, projectId: selectedProject });
      }
    });
    
    onUpdateAssignments(newAssignments);
    
    toast({
      title: "Przypisano kierowników",
      description: `Przypisano ${selectedManagers.size} kierowników do ${project?.name}`
    });
    
    setSelectedManagers(new Set());
    setSelectedProject('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Przypisania Kierowników do Budów
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Masowe przypisywanie */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Masowe Przypisywanie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-project">Wybierz budowę</Label>
                <select
                  id="bulk-project"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Wybierz budowę</option>
                  {projects.filter(p => p.status === 'active').map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleBulkAssignment}
                  disabled={!selectedProject || selectedManagers.size === 0}
                  className="w-full"
                >
                  Przypisz Wybranych ({selectedManagers.size})
                </Button>
              </div>
            </div>
            
            {selectedProject && (
              <div className="mt-4">
                <Label>Wybierz kierowników do przypisania:</Label>
                <div className="mt-2 space-y-2">
                  {managers.map(manager => (
                    <div key={manager.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`bulk-${manager.id}`}
                        checked={selectedManagers.has(manager.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedManagers);
                          if (checked) {
                            newSelected.add(manager.id);
                          } else {
                            newSelected.delete(manager.id);
                          }
                          setSelectedManagers(newSelected);
                        }}
                      />
                      <Label htmlFor={`bulk-${manager.id}`} className="text-sm">
                        {manager.firstName} {manager.lastName}
                        {isManagerAssigned(manager.id, selectedProject) && (
                          <span className="text-green-600 ml-2">(już przypisany)</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Szczegółowy widok przypisań */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Aktywne Przypisania</h3>
            {projects.filter(p => p.status === 'active').map(project => {
              const projectManagers = getProjectManagers(project.id);
              return (
                <Card key={project.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.location}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {projectManagers.length} kierowników
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {managers.map(manager => {
                        const isAssigned = isManagerAssigned(manager.id, project.id);
                        return (
                          <div 
                            key={manager.id} 
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              isAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UserCheck className={`w-4 h-4 ${isAssigned ? 'text-green-600' : 'text-gray-400'}`} />
                              <div>
                                <p className="text-sm font-medium">
                                  {manager.firstName} {manager.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{manager.phone}</p>
                              </div>
                            </div>
                            <Checkbox
                              checked={isAssigned}
                              onCheckedChange={(checked) => 
                                handleManagerSelection(manager.id, project.id, checked as boolean)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerAssignments;
