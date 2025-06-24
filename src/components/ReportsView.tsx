import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
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

  const exportToExcel = () => {
    const [year, month] = selectedMonth.split('-');
    const monthlyData = getMonthlyReport();
    
    // Uzyskaj liczbę dni w miesiącu
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    // Główny arkusz z podsumowaniem
    const summaryData = monthlyData.map(report => ({
      'Pracownik': `${report.employee.firstName} ${report.employee.lastName}`,
      'Stanowisko': report.employee.position,
      'Godziny Pracy': report.workHours,
      'Dni Urlopu': report.vacationDays,
      'Dni Chorobowe': report.sickDays,
      'Nieobecności': report.absenceDays,
      'Wynagrodzenie (zł)': report.salary
    }));

    // Dodaj wiersz z sumami do głównego arkusza
    if (monthlyData.length > 1) {
      const totalRow = {
        'Pracownik': 'SUMA',
        'Stanowisko': '',
        'Godziny Pracy': monthlyData.reduce((sum, r) => sum + parseFloat(r.workHours), 0).toFixed(2),
        'Dni Urlopu': monthlyData.reduce((sum, r) => sum + r.vacationDays, 0),
        'Dni Chorobowe': monthlyData.reduce((sum, r) => sum + r.sickDays, 0),
        'Nieobecności': monthlyData.reduce((sum, r) => sum + r.absenceDays, 0),
        'Wynagrodzenie (zł)': totalSalary.toFixed(2)
      };
      summaryData.push(totalRow);
    }

    // Szczegółowy arkusz z godzinami dla każdego dnia
    const detailedData: any[] = [];
    
    // Nagłówek z dniami miesiąca
    const header: any = { 'Pracownik': 'Pracownik' };
    for (let day = 1; day <= daysInMonth; day++) {
      header[`${day}`] = `${day}`;
    }
    header['Suma'] = 'Suma';
    detailedData.push(header);

    // Dane dla każdego pracownika
    monthlyData.forEach(report => {
      const row: any = { 'Pracownik': `${report.employee.firstName} ${report.employee.lastName}` };
      let totalHours = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayString = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayEntries = timeEntries.filter(entry => 
          entry.employeeId === report.employee.id &&
          entry.date === dayString &&
          entry.type === 'work' &&
          (!selectedEmployee || report.employee.id === selectedEmployee)
        );
        
        const dayHours = dayEntries.reduce((sum, entry) => sum + calculateWorkHours(entry), 0);
        row[`${day}`] = dayHours > 0 ? dayHours.toFixed(2) : '';
        totalHours += dayHours;
      }
      
      row['Suma'] = totalHours.toFixed(2);
      detailedData.push(row);
    });

    // Stwórz workbook z dwoma arkuszami
    const workbook = XLSX.utils.book_new();
    
    // Arkusz podsumowania
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    
    // Arkusz szczegółowy
    const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData, { skipHeader: true });
    
    // Dodaj arkusze do workbook
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Podsumowanie');
    XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Godziny dzienne');
    
    const fileName = `Raport_${monthName}_${year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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
            <div className="flex items-end gap-2">
              <Button 
                onClick={() => window.print()}
                className="flex-1"
              >
                Drukuj Raport
              </Button>
              <Button 
                onClick={exportToExcel}
                variant="outline"
                className="flex-1"
                disabled={monthlyData.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
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
