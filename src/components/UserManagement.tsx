
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemUser {
  id: string;
  username: string;
  role: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    permissions: {
      viewReports: false,
      viewRates: false,
      manageProjects: false,
      manageEmployees: false,
      manageEquipment: false,
      viewTimeTracking: true
    },
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy użytkowników",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || (!editingUser && !formData.password)) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie wymagane pola",
        variant: "destructive"
      });
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast({
        title: "Błąd",
        description: "Hasła nie są identyczne",
        variant: "destructive"
      });
      return;
    }

    try {
      const userData = {
        username: formData.username,
        role: formData.role,
        permissions: formData.permissions,
        is_active: formData.is_active,
        ...(formData.password && { password_hash: btoa(formData.password) }) // Proste szyfrowanie dla demo
      };

      if (editingUser) {
        const { error } = await supabase
          .from('system_users')
          .update(userData)
          .eq('id', editingUser.id);

        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Użytkownik został zaktualizowany"
        });
      } else {
        const { error } = await supabase
          .from('system_users')
          .insert([{ ...userData, password_hash: btoa(formData.password) }]);

        if (error) throw error;
        
        toast({
          title: "Sukces",
          description: "Użytkownik został dodany"
        });
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać użytkownika",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: SystemUser) => {
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
      role: user.role,
      permissions: user.permissions || {
        viewReports: false,
        viewRates: false,
        manageProjects: false,
        manageEmployees: false,
        manageEquipment: false,
        viewTimeTracking: true
      },
      is_active: user.is_active
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Sukces",
        description: "Użytkownik został usunięty"
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć użytkownika",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      permissions: {
        viewReports: false,
        viewRates: false,
        manageProjects: false,
        manageEmployees: false,
        manageEquipment: false,
        viewTimeTracking: true
      },
      is_active: true
    });
    setShowForm(false);
    setEditingUser(undefined);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Kierownik';
      case 'employee': return 'Pracownik';
      default: return role;
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: checked
      }
    });
  };

  if (showForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {editingUser ? 'Edytuj Użytkownika' : 'Dodaj Nowego Użytkownika'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Nazwa użytkownika *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="np. jan.kowalski"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Hasło {!editingUser && '*'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "Pozostaw puste aby nie zmieniać" : "Wprowadź hasło"}
                required={!editingUser}
              />
            </div>

            {!editingUser && (
              <div>
                <Label htmlFor="confirmPassword">Potwierdź hasło *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Potwierdź hasło"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="role">Rola</Label>
              <select
                id="role"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="employee">Pracownik</option>
                <option value="manager">Kierownik</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <Label>Uprawnienia</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="viewTimeTracking"
                    checked={formData.permissions.viewTimeTracking}
                    onCheckedChange={(checked) => handlePermissionChange('viewTimeTracking', checked as boolean)}
                  />
                  <Label htmlFor="viewTimeTracking">Czas pracy</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="viewRates"
                    checked={formData.permissions.viewRates}
                    onCheckedChange={(checked) => handlePermissionChange('viewRates', checked as boolean)}
                  />
                  <Label htmlFor="viewRates">Stawki pracowników</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="viewReports"
                    checked={formData.permissions.viewReports}
                    onCheckedChange={(checked) => handlePermissionChange('viewReports', checked as boolean)}
                  />
                  <Label htmlFor="viewReports">Raporty</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageProjects"
                    checked={formData.permissions.manageProjects}
                    onCheckedChange={(checked) => handlePermissionChange('manageProjects', checked as boolean)}
                  />
                  <Label htmlFor="manageProjects">Zarządzanie budowami</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageEmployees"
                    checked={formData.permissions.manageEmployees}
                    onCheckedChange={(checked) => handlePermissionChange('manageEmployees', checked as boolean)}
                  />
                  <Label htmlFor="manageEmployees">Zarządzanie pracownikami</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manageEquipment"
                    checked={formData.permissions.manageEquipment}
                    onCheckedChange={(checked) => handlePermissionChange('manageEquipment', checked as boolean)}
                  />
                  <Label htmlFor="manageEquipment">Zarządzanie sprzętem</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Konto aktywne</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Anuluj
              </Button>
              <Button type="submit">
                {editingUser ? 'Zaktualizuj' : 'Dodaj'}
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
        <h2 className="text-2xl font-bold">Zarządzanie Użytkownikami</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj Użytkownika
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.username}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleText(user.role)}
                    </span>
                    {!user.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Nieaktywne
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Utworzone:</strong> {new Date(user.created_at).toLocaleDateString('pl-PL')}</p>
                    <div>
                      <strong>Uprawnienia:</strong>
                      <div className="ml-4 text-sm">
                        {user.permissions?.viewTimeTracking && <span className="block">• Czas pracy</span>}
                        {user.permissions?.viewRates && <span className="block">• Stawki pracowników</span>}
                        {user.permissions?.viewReports && <span className="block">• Raporty</span>}
                        {user.permissions?.manageProjects && <span className="block">• Zarządzanie budowami</span>}
                        {user.permissions?.manageEmployees && <span className="block">• Zarządzanie pracownikami</span>}
                        {user.permissions?.manageEquipment && <span className="block">• Zarządzanie sprzętem</span>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Usuń
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {users.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Brak użytkowników. Dodaj pierwszego użytkownika, aby rozpocząć.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
