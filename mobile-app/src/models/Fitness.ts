export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number; // Optional weight in kg/lbs
  restSeconds: number; // Rest after each set in seconds
  notes?: string; // Optional notes
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  color: string;
}

export interface WorkoutSession {
  routineId: string;
  startTime: number;
  activeExerciseIndex: number;
  currentSet: number; // 1-indexed
  isResting: boolean;
  restEndTime?: number; // timestamp when rest is over
  restNotificationId?: string; // id to cancel if user skips
}
