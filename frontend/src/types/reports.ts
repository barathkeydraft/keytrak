export interface DailySummary {
  date: string;
  totalWorkHours: number;
  tasksCompleted: {
    id: string;
    name: string;
    status: string;
    updatedAt: string;
  }[];
  notes: string;
  employeeId: string;
  employeeName: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
}

export interface WorkHourReport {
  employeeId: string;
  employeeName: string;
  date: string;
  totalHours: number;
  breakTime: number;
}

export interface TaskReport {
  date: string;
  tasks: {
    id: string;
    name: string;
    status: string;
    assignedTo: string;
    updatedAt: string;
  }[];
} 