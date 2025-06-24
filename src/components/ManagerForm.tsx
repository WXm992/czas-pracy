
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Manager {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  experience: string;
}

interface ManagerFormProps {
  manager?: Manager;
  onSave: (manager: Manager) => void;
  onCancel: () => void;
}

const ManagerForm: React.FC<ManagerFormProps> = ({ manager, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Manager>({
    firstName: manager?.firstName || '',
    lastName: manager?.lastName || '',
    phone: manager?.phone || '',
    email: manager?.email || '',
    experience: manager?.experience || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić imię i nazwisko",
        variant: "destructive"
      });
      return;
    }

    onSave({
      ...formData,
      id: manager?.id || Date.now().toString()
    });

    toast({
      title: "Sukces",
      description: manager ? "Kierownik został zaktualizowany" : "Kierownik został dodany"
    });
  };

  const handleChange = (field: keyof Manager, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {manager ? 'Edytuj Kierownika' : 'Dodaj Nowego Kierownika'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+48 123 456 789"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="experience">Doświadczenie</Label>
            <Input
              id="experience"
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              placeholder="np. 10 lat doświadczenia w budownictwie"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
            <Button type="submit">
              {manager ? 'Zaktualizuj' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManagerForm;
