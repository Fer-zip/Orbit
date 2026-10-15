export interface Task {
  id: string;
  title: string;
  type: 'EVENT' | 'TODO' | 'HABIT';
  status: 'PENDING' | 'DONE';
  importance?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: number; 
  has_time?: boolean; // Determina si due_date es un día completo o tiene hora específica
  recurrence_rule?: string; // Ej: "DAILY", "WEEKLY", "MONTHLY"
  last_completed_at?: number;
  created_at: number;
  updated_at: number;
  notification_ids?: string[];
}
