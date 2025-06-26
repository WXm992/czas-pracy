
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

  const getWeeklyData = () => {
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const weeks: any[] = [];
    
    // Podziel miesiąc na tygodnie
    let currentWeek: number[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 1 && currentWeek.length > 0) { // Poniedziałek - nowy tydzień
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const exportToExcel = () => {
    const [year, month] = selectedMonth.split('-');
    const monthlyData = getMonthlyReport();
    const weeks = getWeeklyData();
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    const workbook = XLSX.utils.book_new();

    // === ARKUSZ 1: PODSUMOWANIE MIESIĘCZNE ===
    const summaryData: any[] = [
      ['RAPORT MIESIĘCZNY', '', '', '', '', '', ''],
      [`Miesiąc: ${month}/${year}`, '', '', '', '', '', ''],
      ['', '', '', '', '', '', ''],
      ['Pracownik', 'Stanowisko', 'Godziny Pracy', 'Dni Urlopu', 'Dni Chorobowe', 'Nieobecności', 'Wynagrodzenie (zł)']
    ];

    monthlyData.forEach(report => {
      summaryData.push([
        `${report.employee.firstName} ${report.employee.lastName}`,
        report.employee.position,
        parseFloat(report.workHours),
        report.vacationDays,
        report.sickDays,
        report.absenceDays,
        parseFloat(report.salary)
      ]);
    });

    // Dodaj sumę
    if (monthlyData.length > 1) {
      summaryData.push(['', '', '', '', '', '', '']);
      summaryData.push([
        'SUMA',
        '',
        monthlyData.reduce((sum, r) => sum + parseFloat(r.workHours), 0),
        monthlyData.reduce((sum, r) => sum + r.vacationDays, 0),
        monthlyData.reduce((sum, r) => sum + r.sickDays, 0),
        monthlyData.reduce((sum, r) => sum + r.absenceDays, 0),
        monthlyData.reduce((sum, r) => sum + parseFloat(r.salary), 0)
      ]);
    }

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Formatowanie arkusza podsumowania
    const summaryRange = XLSX.utils.decode_range(summaryWorksheet['!ref'] || 'A1:G10');
    summaryWorksheet['!cols'] = [
      { width: 25 }, { width: 20 }, { width: 15 }, 
      { width: 12 }, { width: 15 }, { width: 12 }, { width: 18 }
    ];

    // === ARKUSZ 2: GODZINY DZIENNE ===
    const dailyData: any[] = [
      ['GODZINY DZIENNE', ...Array(daysInMonth).fill(''), 'SUMA'],
      ['Pracownik', ...Array.from({length: daysInMonth}, (_, i) => (i + 1).toString()), 'Suma']
    ];

    monthlyData.forEach(report => {
      const row = [`${report.employee.firstName} ${report.employee.lastName}`];
      let totalHours = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dayString = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayEntries = timeEntries.filter(entry => 
          entry.employeeId === report.employee.id &&
          entry.date === dayString &&
          entry.type === 'work'
        );
        
        const dayHours = dayEntries.reduce((sum, entry) => sum + calculateWorkHours(entry), 0);
        row.push(dayHours > 0 ? dayHours.toString() : '');
        totalHours += dayHours;
      }
      
      row.push(totalHours.toString());
      dailyData.push(row);
    });

    const dailyWorksheet = XLSX.utils.aoa_to_sheet(dailyData);
    dailyWorksheet['!cols'] = [{ width: 25 }, ...Array(daysInMonth + 1).fill({ width: 5 })];

    // === ARKUSZ 3: PODSUMOWANIA TYGODNIOWE ===
    const weeklyData: any[] = [
      ['PODSUMOWANIA TYGODNIOWE', '', '', '', ''],
      ['', '', '', '', '']
    ];

    weeks.forEach((week, weekIndex) => {
      weeklyData.push([`TYDZIEŃ ${weekIndex + 1} (dni: ${week.join(', ')})`, '', '', '', '']);
      weeklyData.push(['Pracownik', 'Godziny', 'Dni Pracy', 'Średnia/dzień', 'Wynagrodzenie']);
      
      monthlyData.forEach(report => {
        let weekHours = 0;
        let workDays = 0;
        
        week.forEach((day: number) => {
          const dayString = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const dayEntries = timeEntries.filter(entry => 
            entry.employeeId === report.employee.id &&
            entry.date === dayString &&
            entry.type === 'work'
          );
          
          const dayHours = dayEntries.reduce((sum, entry) => sum + calculateWorkHours(entry), 0);
          if (dayHours > 0) {
            weekHours += dayHours;
            workDays++;
          }
        });
        
        const weekSalary = weekHours * report.employee.hourlyRate;
        const avgHours = workDays > 0 ? weekHours / workDays : 0;
        
        weeklyData.push([
          `${report.employee.firstName} ${report.employee.lastName}`,
          weekHours.toFixed(2),
          workDays.toString(),
          avgHours.toFixed(2),
          weekSalary.toFixed(2)
        ]);
      });
      
      weeklyData.push(['', '', '', '', '']); // Pusty wiersz między tygodniami
    });

    const weeklyWorksheet = XLSX.utils.aoa_to_sheet(weeklyData);
    weeklyWorksheet['!cols'] = [
      { width: 25 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 18 }
    ];

    // === ARKUSZ 4: STATYSTYKI ===
    const statsData: any[] = [
      ['STATYSTYKI MIESIĘCZNE', '', ''],
      ['', '', ''],
      ['Metryka', 'Wartość', 'Jednostka'],
      ['Łączne godziny pracy', monthlyData.reduce((sum, r) => sum + parseFloat(r.workHours), 0).toFixed(2), 'godz'],
      ['Średnie godziny/pracownik', (monthlyData.reduce((sum, r) => sum + parseFloat(r.workHours), 0) / monthlyData.length).toFixed(2), 'godz'],
      ['Łączne wynagrodzenia', monthlyData.reduce((sum, r) => sum + parseFloat(r.salary), 0).toFixed(2), 'zł'],
      ['Średnie wynagrodzenie', (monthlyData.reduce((sum, r) => sum + parseFloat(r.salary), 0) / monthlyData.length).toFixed(2), 'zł'],
      ['Liczba pracowników', monthlyData.length.toString(), 'osób'],
      ['Dni urlopowe (łącznie)', monthlyData.reduce((sum, r) => sum + r.vacationDays, 0).toString(), 'dni'],
      ['Dni chorobowe (łącznie)', monthlyData.reduce((sum, r) => sum + r.sickDays, 0).toString(), 'dni'],
      ['Nieobecności (łącznie)', monthlyData.reduce((sum, r) => sum + r.absenceDays, 0).toString(), 'dni']
    ];

    const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
    statsWorksheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 12 }];

    // Dodaj arkusze do workbook
    const monthNames = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Podsumowanie');
    XLSX.utils.book_append_sheet(workbook, dailyWorksheet, 'Godziny dzienne');
    XLSX.utils.book_append_sheet(workbook, weeklyWorksheet, 'Tygodnie');
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Statystyki');
    
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
