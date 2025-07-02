
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Calendar, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Equipment {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  condition: string;
  notes?: string;
  purchase_date?: string;
}

interface EquipmentAssignment {
  id: string;
  equipment_id: string;
  project_id: string;
  assigned_date: string;
  returned_date?: string;
  is_active: boolean;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
}

const EquipmentManager: React.FC = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<EquipmentAssignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    condition: 'good',
    notes: '',
    purchase_date: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data: equipmentData, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) throw error;
      setEquipment(equipmentData || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy sprzętu",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić nazwę i kategorię",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingEquipment) {
        const { error } = await supabase
          .from('equipment')
          .update(formData)
          .eq('id', editingEquipment.id);

        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Sprzęt został zaktualizowany"
        });
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Sprzęt został dodany"
        });
      }

      resetForm();
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać sprzętu",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setFormData({
      name: equipment.name,
      category: equipment.category,
      brand: equipment.brand || '',
      model: equipment.model || '',
      serial_number: equipment.serial_number || '',
      condition: equipment.condition,
      notes: equipment.notes || '',
      purchase_date: equipment.purchase_date || ''
    });
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const handleDelete = async (equipmentId: string) => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Sprzęt został usunięty"
      });
      
      fetchEquipment();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć sprzętu",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      model: '',
      serial_number: '',
      condition: 'good',
      notes: '',
      purchase_date: ''
    });
    setShowForm(false);
    setEditingEquipment(undefined);
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

  if (showForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {editingEquipment ? 'Edytuj Sprzęt' : 'Dodaj Nowy Sprzęt'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nazwa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="np. Wiertarka udarowa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategoria *</Label>
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Wybierz kategorię</option>
                  <option value="narzędzia_ręczne">Narzędzia ręczne</option>
                  <option value="narzędzia_elektryczne">Narzędzia elektryczne</option>
                  <option value="maszyny">Maszyny</option>
                  <option value="bezpieczeństwo">Bezpieczeństwo</option>
                  <option value="pomiary">Pomiary</option>
                  <option value="transport">Transport</option>
                  <option value="inne">Inne</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marka</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="np. Bosch"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="np. GSB 13 RE"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serial_number">Numer seryjny</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="np. SN123456789"
                />
              </div>
              <div>
                <Label htmlFor="purchase_date">Data zakupu</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="condition">Stan</Label>
              <select
                id="condition"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="good">Dobry</option>
                <option value="fair">Zadowalający</option>
                <option value="poor">Zły</option>
                <option value="maintenance">Konserwacja</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Dodatkowe informacje o sprzęcie"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingEquipment ? 'Zaktualizuj' : 'Dodaj'}
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
        <h2 className="text-2xl font-bold">Zarządzanie Sprzętem</h2>
        <Button onClick={() => setShowForm(true)}>
          <Wrench className="w-4 h-4 mr-2" />
          Dodaj Sprzęt
        </Button>
      </div>

      <div className="grid gap-4">
        {equipment.map(item => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                      {getConditionText(item.condition)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Kategoria:</strong> {item.category.replace('_', ' ')}</p>
                    {item.brand && <p><strong>Marka:</strong> {item.brand}</p>}
                    {item.model && <p><strong>Model:</strong> {item.model}</p>}
                    {item.serial_number && <p><strong>Nr seryjny:</strong> {item.serial_number}</p>}
                    {item.purchase_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Zakupiony: {new Date(item.purchase_date).toLocaleDateString('pl-PL')}</span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm mt-2">{item.notes}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    Usuń
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {equipment.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Brak sprzętu. Dodaj pierwszy element, aby rozpocząć.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EquipmentManager;
