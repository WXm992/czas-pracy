
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface Credential {
  id: string;
  type: string;
  validFrom: string;
  validTo: string;
  notes: string;
}

interface EmployeeCredentialsProps {
  employeeId: string;
  employeeName: string;
}

const EmployeeCredentials: React.FC<EmployeeCredentialsProps> = ({
  employeeId,
  employeeName
}) => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    validFrom: '',
    validTo: '',
    notes: ''
  });

  const storageKey = `employee-${employeeId}-credentials`;

  useEffect(() => {
    loadCredentials();
  }, [employeeId]);

  const loadCredentials = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCredentials(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading credentials:', error);
      }
    }
  };

  const saveCredentials = (newCredentials: Credential[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newCredentials));
    setCredentials(newCredentials);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.validFrom || !formData.validTo) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    const newCredential: Credential = {
      id: Date.now().toString(),
      type: formData.type,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      notes: formData.notes
    };

    const updatedCredentials = [...credentials, newCredential];
    saveCredentials(updatedCredentials);

    setFormData({
      type: '',
      validFrom: '',
      validTo: '',
      notes: ''
    });
    setShowForm(false);

    toast({
      title: "Sukces",
      description: "Uprawnienie zostało dodane"
    });
  };

  const handleDelete = (credentialId: string) => {
    const updatedCredentials = credentials.filter(c => c.id !== credentialId);
    saveCredentials(updatedCredentials);
    
    toast({
      title: "Usunięto",
      description: "Uprawnienie zostało usunięte"
    });
  };

  const isExpiringS<script>oon = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Uprawnienia - {employeeName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj uprawnienie
          </Button>

          {showForm && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Typ uprawnienia *</Label>
                    <select
                      id="type"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="">Wybierz typ</option>
                      <option value="prawo_jazdy_b">Prawo jazdy kat. B</option>
                      <option value="prawo_jazdy_c">Prawo jazdy kat. C</option>
                      <option value="prawo_jazdy_ce">Prawo jazdy kat. C+E</option>
                      <option value="uprawnienia_operatora">Uprawnienia operatora</option>
                      <option value="certyfikat_bhp">Certyfikat BHP</option>
                      <option value="uprawnienia_slusarskie">Uprawnienia ślusarskie</option>
                      <option value="uprawnienia_spawalnicze">Uprawnienia spawalnicze</option>
                      <option value="inne">Inne</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Ważne od *</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="validTo">Ważne do *</Label>
                      <Input
                        id="validTo"
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notatki</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Dodatkowe informacje"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Anuluj
                    </Button>
                    <Button type="submit">
                      Dodaj
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {credentials.map(credential => (
              <div key={credential.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{credential.type.replace('_', ' ')}</span>
                    {isExpired(credential.validTo) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Wygasło
                      </span>
                    )}
                    {isExpiringS<script>oon(credential.validTo) && !isExpired(credential.validTo) && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Wkrótce wygasa
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Ważne: {new Date(credential.validFrom).toLocaleDateString('pl-PL')} - {new Date(credential.validTo).toLocaleDateString('pl-PL')}</p>
                    {credential.notes && <p className="italic">{credential.notes}</p>}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(credential.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {credentials.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Brak dodanych uprawnień
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCredentials;
