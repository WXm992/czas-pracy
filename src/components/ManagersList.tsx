
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';

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
  managerId: string;
}

interface ManagersListProps {
  managers: Manager[];
  projects: Project[];
  onAddManager: () => void;
  onEditManager: (manager: Manager) => void;
  onDeleteManager: (managerId: string) => void;
}

const ManagersList: React.FC<ManagersListProps> = ({
  managers,
  projects,
  onAddManager,
  onEditManager,
  onDeleteManager
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kierownicy Budowy</h2>
        <Button onClick={onAddManager}>
          <UserCheck className="w-4 h-4 mr-2" />
          Dodaj Kierownika
        </Button>
      </div>
      
      <div className="grid gap-4">
        {managers.map(manager => (
          <Card key={manager.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {manager.firstName} {manager.lastName}
                  </h3>
                  <p className="text-gray-600 mb-1">Tel: {manager.phone}</p>
                  <p className="text-gray-600 mb-1">Email: {manager.email}</p>
                  <p className="text-gray-600">{manager.experience}</p>
                  <p className="text-sm text-blue-600 mt-2">
                    Budowy: {projects.filter(p => p.managerId === manager.id).length}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => onEditManager(manager)}
                  >
                    Edytuj
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDeleteManager(manager.id)}
                  >
                    Usuń
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagersList;
