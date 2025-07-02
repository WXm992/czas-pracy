
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Plus } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  projectId?: string;
}

interface EmployeeProjectManagerProps {
  employees: Employee[];
  selectedProjectId: string;
  onUpdateEmployeeProject: (employeeId: string, projectId: string | undefined) => void;
}

const EmployeeProjectManager: React.FC<EmployeeProjectManagerProps> = ({
  employees,
  selectedProjectId,
  onUpdateEmployeeProject
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  // Zapamiętaj ostatnio wybranych pracowników dla tego projektu
  const storageKey = `project-${selectedProjectId}-employees`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const storedEmployees = JSON.parse(stored);
        setSelectedEmployees(new Set(storedEmployees));
      } catch (error) {
        console.error('Error loading stored employees:', error);
      }
    }
  }, [selectedProjectId, storageKey]);

  const saveToStorage = (employeeIds: Set<string>) => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(employeeIds)));
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectEmployees = employees.filter(emp => emp.projectId === selectedProjectId);
  const availableEmployees = employees.filter(emp => !emp.projectId || emp.projectId === selectedProjectId);

  const handleEmployeeSelection = (employeeId: string, selected: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (selected) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
    saveToStorage(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
      saveToStorage(new Set());
    } else {
      const allIds = new Set(filteredEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
      saveToStorage(allIds);
    }
  };

  const handleAddSelectedToProject = () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "Błąd",
        description: "Nie wybrano żadnych pracowników",
        variant: "destructive"
      });
      return;
    }

    let addedCount = 0;
    selectedEmployees.forEach(employeeId => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee && employee.projectId !== selectedProjectId) {
        onUpdateEmployeeProject(employeeId, selectedProjectId);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast({
        title: "Sukces",
        description: `Dodano ${addedCount} pracowników do budowy`
      });
    }

    setSelectedEmployees(new Set());
    saveToStorage(new Set());
  };

  const handleRemoveFromProject = (employeeId: string) => {
    onUpdateEmployeeProject(employeeId, undefined);
    toast({
      title: "Usunięto",
      description: "Pracownik został usunięty z budowy"
    });
  };

  const isEmployeeInProject = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.projectId === selectedProjectId;
  };

  return (
    <div className="space-y-6">
      {/* Aktualni pracownicy na budowie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pracownicy na budowie ({projectEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectEmployees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                  <div>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromProject(employee.id)}
                  >
                    Usuń
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Brak pracowników przypisanych do tej budowy
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dodawanie pracowników */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Dodaj pracowników do budowy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Wyszukiwanie */}
            <div>
              <Label htmlFor="employee-search">Wyszukaj pracowników</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="employee-search"
                  type="text"
                  placeholder="Wpisz imię, nazwisko lub stanowisko..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-employees"
                  checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all-employees">
                  Zaznacz wszystkich ({filteredEmployees.length})
                </Label>
              </div>
              {selectedEmployees.size > 0 && (
                <Button onClick={handleAddSelectedToProject}>
                  Dodaj wybranych ({selectedEmployees.size})
                </Button>
              )}
            </div>

            {/* Lista pracowników */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredEmployees.map(employee => {
                const isSelected = selectedEmployees.has(employee.id);
                const isInProject = isEmployeeInProject(employee.id);
                const isAvailable = !employee.projectId || employee.projectId === selectedProjectId;

                return (
                  <div
                    key={employee.id}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      isInProject 
                        ? 'bg-green-50 border-green-200' 
                        : isSelected 
                          ? 'bg-blue-50 border-blue-200' 
                          : !isAvailable
                            ? 'bg-gray-50 border-gray-200 opacity-50'
                            : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleEmployeeSelection(employee.id, checked as boolean)}
                        disabled={!isAvailable}
                      />
                      <div>
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                          {isInProject && <span className="text-green-600 ml-2">(na budowie)</span>}
                          {!isAvailable && !isInProject && <span className="text-gray-500 ml-2">(zajęty)</span>}
                        </p>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? `Nie znaleziono pracowników dla "${searchTerm}"` : 'Brak dostępnych pracowników'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProjectManager;
