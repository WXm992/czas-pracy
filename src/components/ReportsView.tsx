
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  hourlyRate: number;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  type: 'work' | 'vacation' | 'sick' | 'absence';
}

interface ReportsViewProps {
  employees: Employee[];
  timeEntries: TimeEntry[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ employees, timeEntries }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const calculateWorkHours = (entry: TimeEntry): number => {
    if (entry.type !== 'work') return 0;
    
    const start = new Date(`2000-01-01T${entry.startTime}`);
    const end = new Date(`2000-01-01T${entry.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours - (entry.breakTime / 60));
  };

  const getMonthlyReport = () => {
    const [year, month] = selectedMonth.split('-');
    
    return employees.map(employee => {
      const employeeEntries = timeEntries.filter(entry => 
        entry.employeeId === employee.id &&
        entry.date.startsWith(`${year}-${month}`) &&
        (!selectedEmployee || employee.id === selectedEmployee)
      );

      const workHours = employeeEntries
        .filter(entry => entry.type === 'work')
        .reduce((sum, entry) => sum + calculateWorkHours(entry), 0);

      const vacationDays = employeeEntries.filter(entry => entry.type === 'vacation').length;
      const sickDays = employeeEntries.filter(entry => entry.type === 'sick').length;
      const absenceDays = employeeEntries.filter(entry => entry.type === 'absence').length;

      const salary = workHours * employee.hourlyRate;

      return {
        employee,
        workHours: workHours.toFixed(2),
        vacationDays,
        sickDays,
        absenceDays,
        salary: salary.toFixed(2)
      };
    }).filter(report => !selectedEmployee || report.employee.id === selectedEmployee);
  };

  const monthlyData = getMonthlyReport();
  const totalSalary = monthlyData.reduce((sum, report) => sum + parseFloat(report.salary), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Raporty Miesięczne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="month">Miesiąc</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="employee">Pracownik (opcjonalnie)</Label>
              <select
                id="employee"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Wszyscy pracownicy</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => window.print()}
                className="w-full"
              >
                Drukuj Raport
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pracownik</TableHead>
                  <TableHead>Godziny Pracy</TableHead>
                  <TableHead>Dni Urlopu</TableHead>
                  <TableHead>Dni Chorobowe</TableHead>
                  <TableHead>Nieobecności</TableHead>
                  <TableHead>Wynagrodzenie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((report) => (
                  <TableRow key={report.employee.id}>
                    <TableCell className="font-medium">
                      {report.employee.firstName} {report.employee.lastName}
                    </TableCell>
                    <TableCell>{report.workHours} h</TableCell>
                    <TableCell>{report.vacationDays}</TableCell>
                    <TableCell>{report.sickDays}</TableCell>
                    <TableCell>{report.absenceDays}</TableCell>
                    <TableCell className="font-medium">{report.salary} zł</TableCell>
                  </TableRow>
                ))}
                {monthlyData.length > 1 && (
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell>SUMA</TableCell>
                    <TableCell>
                      {monthlyData.reduce((sum, r) => sum + parseFloat(r.workHours), 0).toFixed(2)} h
                    </TableCell>
                    <TableCell>
                      {monthlyData.reduce((sum, r) => sum + r.vacationDays, 0)}
                    </TableCell>
                    <TableCell>
                      {monthlyData.reduce((sum, r) => sum + r.sickDays, 0)}
                    </TableCell>
                    <TableCell>
                      {monthlyData.reduce((sum, r) => sum + r.absenceDays, 0)}
                    </TableCell>
                    <TableCell>{totalSalary.toFixed(2)} zł</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {monthlyData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Brak danych dla wybranego okresu
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
