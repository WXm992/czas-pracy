import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin, Calendar, ChevronDown, ChevronUp, Users, Wrench } from 'lucide-react';
import ProjectEquipmentManager from './ProjectEquipmentManager';

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  status: 'active' | 'completed' | 'paused';
  managerId: string;
}

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
}

interface ManagerAssignment {
  managerId: string;
  projectId: string;
}

interface ProjectManagerProps {
  projects: Project[];
  managers: Manager[];
  assignments: ManagerAssignment[];
  onSave: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onUpdateAssignments: (assignments: ManagerAssignment[]) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  managers,
  assignments,
  onSave,
  onEdit,
  onDelete,
  onUpdateAssignments
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedEquipment, setExpandedEquipment] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'completed' | 'paused',
    managerId: ''
  });

  const getProjectManagers = (projectId: string) => {
    return assignments
      .filter(a => a.projectId === projectId)
      .map(a => managers.find(m => m.id === a.managerId))
      .filter(Boolean);
  };

  const isManagerAssigned = (managerId: string, projectId: string) => {
    return assignments.some(a => a.managerId === managerId && a.projectId === projectId);
  };

  const handleManagerAssignment = (managerId: string, projectId: string, assigned: boolean) => {
    let newAssignments = [...assignments];
    
    if (assigned) {
      newAssignments.push({ managerId, projectId });
    } else {
      newAssignments = newAssignments.filter(
        a => !(a.managerId === managerId && a.projectId === projectId)
      );
    }
    
    onUpdateAssignments(newAssignments);
    
    const manager = managers.find(m => m.id === managerId);
    toast({
      title: assigned ? "Przypisano kierownika" : "Usunięto przypisanie",
      description: `${manager?.firstName} ${manager?.lastName} ${assigned ? 'został przypisany do' : 'został usunięty z'} budowy`
    });
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleEquipmentExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedEquipment);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedEquipment(newExpanded);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.managerId) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      ...formData,
      id: editingProject?.id || Date.now().toString()
    };

    onSave(project);
    
    toast({
      title: "Sukces",
      description: editingProject ? "Budowa została zaktualizowana" : "Budowa została dodana"
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      managerId: ''
    });
    setShowForm(false);
    setEditingProject(undefined);
  };

  const handleEdit = (project: Project) => {
    setFormData(project);
    setEditingProject(project);
    setShowForm(true);
  };

  const getManagerName = (managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'Nieznany';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywna';
      case 'completed': return 'Zakończona';
      case 'paused': return 'Wstrzymana';
      default: return status;
    }
  };

  if (showForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {editingProject ? 'Edytuj Budowę' : 'Dodaj Nową Budowę'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nazwa budowy *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. Budowa domu jednorodzinnego"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Lokalizacja *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="np. ul. Kwiatowa 15, Warszawa"
                required
              />
            </div>

            <div>
              <Label htmlFor="managerId">Główny kierownik budowy *</Label>
              <select
                id="managerId"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                required
              >
                <option value="">Wybierz kierownika</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data rozpoczęcia</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Aktywna</option>
                  <option value="paused">Wstrzymana</option>
                  <option value="completed">Zakończona</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Dodatkowe informacje o budowie"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingProject ? 'Zaktualizuj' : 'Dodaj'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Zarządzanie Budowami</h2>
        <Button onClick={() => setShowForm(true)}>
          <Building className="w-4 h-4 mr-2" />
          Dodaj Budowę
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map(project => {
          const projectManagers = getProjectManagers(project.id);
          const isExpanded = expandedProjects.has(project.id);
          const isEquipmentExpanded = expandedEquipment.has(project.id);
          
          return (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Rozpoczęta: {new Date(project.startDate).toLocaleDateString('pl-PL')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Kierownicy: {projectManagers.length}</span>
                      </div>
                      {project.description && (
                        <p className="text-sm mt-2">{project.description}</p>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
                      {/* Przycisk rozwijania kierowników */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProjectExpansion(project.id)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Zarządzaj kierownikami
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>

                      {/* Przycisk rozwijania sprzętu */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEquipmentExpansion(project.id)}
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Zarządzaj sprzętem
                        {isEquipmentExpanded ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    </div>

                    {/* Rozwinięta lista kierowników */}
                    {isExpanded && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-3">Przypisz kierowników do budowy:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                  <span className="text-sm font-medium">
                                    {manager.firstName} {manager.lastName}
                                  </span>
                                  {isAssigned && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      Przypisany
                                    </span>
                                  )}
                                </div>
                                <Checkbox
                                  checked={isAssigned}
                                  onCheckedChange={(checked) => 
                                    handleManagerAssignment(manager.id, project.id, checked as boolean)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rozwinięta sekcja sprzętu */}
                    {isEquipmentExpanded && (
                      <div className="border-t pt-4 mt-4">
                        <ProjectEquipmentManager
                          projectId={project.id}
                          projectName={project.name}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-x-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(project)}
                    >
                      Edytuj
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(project.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {projects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Brak budów. Dodaj pierwszą budowę, aby rozpocząć.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
