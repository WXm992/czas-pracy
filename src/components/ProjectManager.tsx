
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  startDate: string;
  status: 'active' | 'completed' | 'paused';
  managerId: string;
}

interface ProjectManagerProps {
  projects: Project[];
  managers: Array<{ id: string; firstName: string; lastName: string }>;
  onSave: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  managers,
  onSave,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'completed' | 'paused',
    managerId: ''
  });

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
              <Label htmlFor="managerId">Kierownik budowy *</Label>
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
        {projects.map(project => (
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
                  
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Rozpoczęta: {new Date(project.startDate).toLocaleDateString('pl-PL')}</span>
                    </div>
                    <p className="text-sm">
                      <strong>Kierownik:</strong> {getManagerName(project.managerId)}
                    </p>
                    {project.description && (
                      <p className="text-sm mt-2">{project.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-x-2">
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
        ))}
        
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
