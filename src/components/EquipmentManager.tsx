import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Wrench, Calendar, Building2, AlertTriangle, Shield, FileText } from 'lucide-react';
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
  inspection_from?: string;
  inspection_to?: string;
  insurance_company?: string;
  insurance_policy_number?: string;
  insurance_oc?: boolean;
  insurance_ac?: boolean;
  insurance_assistance?: boolean;
  insurance_from?: string;
  insurance_to?: string;
  lease_company?: string;
  lease_from?: string;
  lease_to?: string;
}

const EquipmentManager: React.FC = () => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serial_number: '',
    condition: 'good',
    notes: '',
    purchase_date: '',
    inspection_from: '',
    inspection_to: '',
    insurance_company: '',
    insurance_policy_number: '',
    insurance_oc: false,
    insurance_ac: false,
    insurance_assistance: false,
    insurance_from: '',
    insurance_to: '',
    lease_company: '',
    lease_from: '',
    lease_to: ''
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
      purchase_date: equipment.purchase_date || '',
      inspection_from: equipment.inspection_from || '',
      inspection_to: equipment.inspection_to || '',
      insurance_company: equipment.insurance_company || '',
      insurance_policy_number: equipment.insurance_policy_number || '',
      insurance_oc: equipment.insurance_oc || false,
      insurance_ac: equipment.insurance_ac || false,
      insurance_assistance: equipment.insurance_assistance || false,
      insurance_from: equipment.insurance_from || '',
      insurance_to: equipment.insurance_to || '',
      lease_company: equipment.lease_company || '',
      lease_from: equipment.lease_from || '',
      lease_to: equipment.lease_to || ''
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
      purchase_date: '',
      inspection_from: '',
      inspection_to: '',
      insurance_company: '',
      insurance_policy_number: '',
      insurance_oc: false,
      insurance_ac: false,
      insurance_assistance: false,
      insurance_from: '',
      insurance_to: '',
      lease_company: '',
      lease_from: '',
      lease_to: ''
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

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  if (showForm) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            {editingEquipment ? 'Edytuj Sprzęt' : 'Dodaj Nowy Sprzęt'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Podstawowe informacje */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Podstawowe informacje</h3>
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
                    <option value="pojazdy">Pojazdy</option>
                    <option value="bezpieczeństwo">Bezpieczeństwo</option>
                    <option value="pomiary">Pomiary</option>
                    <option value="transport">Transport</option>
                    <option value="inne">Inne</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                <div></div>
              </div>
            </div>

            {/* Przeglądy */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Przeglądy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inspection_from">Przegląd od</Label>
                  <Input
                    id="inspection_from"
                    type="date"
                    value={formData.inspection_from}
                    onChange={(e) => setFormData({ ...formData, inspection_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="inspection_to">Przegląd do</Label>
                  <Input
                    id="inspection_to"
                    type="date"
                    value={formData.inspection_to}
                    onChange={(e) => setFormData({ ...formData, inspection_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Ubezpieczenia */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Ubezpieczenia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurance_company">Towarzystwo ubezpieczeniowe</Label>
                  <Input
                    id="insurance_company"
                    value={formData.insurance_company}
                    onChange={(e) => setFormData({ ...formData, insurance_company: e.target.value })}
                    placeholder="np. PZU"
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_policy_number">Numer polisy</Label>
                  <Input
                    id="insurance_policy_number"
                    value={formData.insurance_policy_number}
                    onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
                    placeholder="np. POL123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance_oc"
                    checked={formData.insurance_oc}
                    onCheckedChange={(checked) => setFormData({ ...formData, insurance_oc: checked as boolean })}
                  />
                  <Label htmlFor="insurance_oc">OC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance_ac"
                    checked={formData.insurance_ac}
                    onCheckedChange={(checked) => setFormData({ ...formData, insurance_ac: checked as boolean })}
                  />
                  <Label htmlFor="insurance_ac">AC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance_assistance"
                    checked={formData.insurance_assistance}
                    onCheckedChange={(checked) => setFormData({ ...formData, insurance_assistance: checked as boolean })}
                  />
                  <Label htmlFor="insurance_assistance">Assistance</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="insurance_from">Ubezpieczenie od</Label>
                  <Input
                    id="insurance_from"
                    type="date"
                    value={formData.insurance_from}
                    onChange={(e) => setFormData({ ...formData, insurance_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_to">Ubezpieczenie do</Label>
                  <Input
                    id="insurance_to"
                    type="date"
                    value={formData.insurance_to}
                    onChange={(e) => setFormData({ ...formData, insurance_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Leasing */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Leasing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lease_company">Firma leasingowa</Label>
                  <Input
                    id="lease_company"
                    value={formData.lease_company}
                    onChange={(e) => setFormData({ ...formData, lease_company: e.target.value })}
                    placeholder="np. BNP Paribas Leasing"
                  />
                </div>
                <div>
                  <Label htmlFor="lease_from">Leasing od</Label>
                  <Input
                    id="lease_from"
                    type="date"
                    value={formData.lease_from}
                    onChange={(e) => setFormData({ ...formData, lease_from: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lease_to">Leasing do</Label>
                  <Input
                    id="lease_to"
                    type="date"
                    value={formData.lease_to}
                    onChange={(e) => setFormData({ ...formData, lease_to: e.target.value })}
                  />
                </div>
              </div>
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
                    {isExpired(item.inspection_to) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Przegląd przeterminowany
                      </span>
                    )}
                    {isExpiringSoon(item.inspection_to) && !isExpired(item.inspection_to) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Przegląd wkrótce
                      </span>
                    )}
                    {isExpired(item.insurance_to) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Ubezpieczenie wygasło
                      </span>
                    )}
                    {isExpiringSoon(item.insurance_to) && !isExpired(item.insurance_to) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Ubezpieczenie wkrótce
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
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

                    {/* Przeglądy */}
                    {(item.inspection_from || item.inspection_to) && (
                      <div className="mt-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Przeglądy
                        </h4>
                        {item.inspection_from && (
                          <p className="text-sm ml-6">Od: {new Date(item.inspection_from).toLocaleDateString('pl-PL')}</p>
                        )}
                        {item.inspection_to && (
                          <p className="text-sm ml-6">Do: {new Date(item.inspection_to).toLocaleDateString('pl-PL')}</p>
                        )}
                      </div>
                    )}

                    {/* Ubezpieczenia */}
                    {(item.insurance_company || item.insurance_policy_number || item.insurance_from || item.insurance_to) && (
                      <div className="mt-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Ubezpieczenia
                        </h4>
                        {item.insurance_company && (
                          <p className="text-sm ml-6">TU: {item.insurance_company}</p>
                        )}
                        {item.insurance_policy_number && (
                          <p className="text-sm ml-6">Polisa: {item.insurance_policy_number}</p>
                        )}
                        <div className="text-sm ml-6">
                          Zakres: {[
                            item.insurance_oc && 'OC',
                            item.insurance_ac && 'AC',
                            item.insurance_assistance && 'Assistance'
                          ].filter(Boolean).join(', ') || 'Brak'}
                        </div>
                        {item.insurance_from && (
                          <p className="text-sm ml-6">Od: {new Date(item.insurance_from).toLocaleDateString('pl-PL')}</p>
                        )}
                        {item.insurance_to && (
                          <p className="text-sm ml-6">Do: {new Date(item.insurance_to).toLocaleDateString('pl-PL')}</p>
                        )}
                      </div>
                    )}

                    {/* Leasing */}
                    {(item.lease_company || item.lease_from || item.lease_to) && (
                      <div className="mt-3">
                        <h4 className="font-medium">Leasing</h4>
                        {item.lease_company && (
                          <p className="text-sm ml-6">Firma: {item.lease_company}</p>
                        )}
                        {item.lease_from && (
                          <p className="text-sm ml-6">Od: {new Date(item.lease_from).toLocaleDateString('pl-PL')}</p>
                        )}
                        {item.lease_to && (
                          <p className="text-sm ml-6">Do: {new Date(item.lease_to).toLocaleDateString('pl-PL')}</p>
                        )}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-sm mt-2 italic">{item.notes}</p>
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
