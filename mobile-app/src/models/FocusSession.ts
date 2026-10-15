export interface FocusSessionConfig {
  id: string;
  title: string;
  total_duration_minutes: number;
  break_interval_minutes: number;
  break_duration_minutes: number;
  created_at: number;
}

export interface FocusSessionState {
  isActive: boolean;
  config: FocusSessionConfig | null;
  started_at: number | null;
  paused_at: number | null;
  accumulated_minutes: number;
  is_on_break: boolean;
  ongoingNotificationId?: string;
  alarmNotificationIds?: string[];
}
