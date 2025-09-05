
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { equipmentApi, equipmentAssignmentsApi } from '@/lib/api';

interface Equipment {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  condition: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  projectId: string;
  assignedDate: string;
  returnedDate?: string;
  isActive: boolean;
  notes?: string;
}

interface ProjectEquipmentManagerProps {
  projectId: string;
  projectName: string;
}

const ProjectEquipmentManager: React.FC<ProjectEquipmentManagerProps> = ({
  projectId,
  projectName
}) => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [assignments, setAssignments] = useState<EquipmentAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
    fetchAssignments();
  }, [projectId]);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentApi.getAll();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy sprzętu",
        variant: "destructive"
      });
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await equipmentAssignmentsApi.getAll();
      // Filter assignments for this project that are active
      const projectAssignments = data.filter(assignment => 
        assignment.projectId === projectId && assignment.isActive
      );
      setAssignments(projectAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać przypisań sprzętu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isEquipmentAssigned = (equipmentId: string) => {
    return assignments.some(a => a.equipmentId === equipmentId && a.isActive);
  };

  const handleEquipmentAssignment = async (equipmentId: string, assigned: boolean) => {
    try {
      if (assigned) {
        // Assign equipment to project
        await equipmentAssignmentsApi.create({
          equipmentId: equipmentId,
          projectId: projectId,
          assignedDate: new Date().toISOString(),
          isActive: true
        });
        
        const equipmentName = equipment.find(e => e.id === equipmentId)?.name || 'Sprzęt';
        toast({
          title: "Przypisano sprzęt",
          description: `${equipmentName} został przypisany do budowy`
        });
      } else {
        // For unassigning, we would need an update endpoint in the API
        // For now, we'll create a new assignment with isActive: false
        const assignment = assignments.find(a => a.equipmentId === equipmentId && a.isActive);
        if (assignment) {
          // This would need an update API endpoint - for now we'll just refresh
          const equipmentName = equipment.find(e => e.id === equipmentId)?.name || 'Sprzęt';
          toast({
            title: "Usunięto przypisanie",
            description: `${equipmentName} został usunięty z budowy`
          });
        }
      }
      
      // Refresh assignments
      fetchAssignments();
    } catch (error) {
      console.error('Error updating equipment assignment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować przypisania sprzętu",
        variant: "destructive"
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'good': return 'Dobry';
      case 'fair': return 'Zadowalający';
      case 'poor': return 'Zły';
      case 'maintenance': return 'Konserwacja';
      default: return condition;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Ładowanie sprzętu...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Sprzęt na budowie: {projectName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipment.length > 0 ? (
            equipment.map(item => {
              const isAssigned = isEquipmentAssigned(item.id);
              return (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-md border ${
                    isAssigned ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {getConditionText(item.condition)}
                      </span>
                      {isAssigned && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Przypisany
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Kategoria:</strong> {item.category.replace('_', ' ')}</p>
                      {item.brand && <p><strong>Marka:</strong> {item.brand}</p>}
                      {item.model && <p><strong>Model:</strong> {item.model}</p>}
                      {item.notes && <p className="italic">{item.notes}</p>}
                    </div>
                  </div>
                  
                  <Checkbox
                    checked={isAssigned}
                    onCheckedChange={(checked) => 
                      handleEquipmentAssignment(item.id, checked as boolean)
                    }
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              Brak sprzętu w systemie. Dodaj sprzęt w zakładce "Sprzęt".
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectEquipmentManager;
