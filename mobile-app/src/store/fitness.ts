import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routine, WorkoutSession } from '../models/Fitness';
import { NotificationService } from '../utils/NotificationService';

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

interface FitnessState {
  routines: Routine[];
  activeWorkout: WorkoutSession | null;
  
  loadRoutines: () => Promise<void>;
  addRoutine: (name: string, color: string) => Promise<string>;
  updateRoutine: (id: string, updates: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  
  startWorkout: (routineId: string) => void;
  completeSet: () => void;
  skipRest: () => void;
  endWorkout: () => void;
}

export const useFitnessStore = create<FitnessState>((set, get) => ({
  routines: [],
  activeWorkout: null,

  loadRoutines: async () => {
    try {
      const data = await AsyncStorage.getItem('@orbit_routines');
      if (data) {
        set({ routines: JSON.parse(data) });
      }
    } catch (e) {
      console.error('Error loading routines:', e);
    }
  },

  addRoutine: async (name: string, color: string) => {
    const newRoutine: Routine = {
      id: generateId(),
      name,
      color,
      exercises: []
    };
    
    const { routines } = get();
    const updated = [...routines, newRoutine];
    set({ routines: updated });
    await AsyncStorage.setItem('@orbit_routines', JSON.stringify(updated));
    return newRoutine.id;
  },

  updateRoutine: async (id, updates) => {
    const { routines } = get();
    const updated = routines.map(r => r.id === id ? { ...r, ...updates } : r);
    set({ routines: updated });
    await AsyncStorage.setItem('@orbit_routines', JSON.stringify(updated));
  },

  deleteRoutine: async (id) => {
    const { routines } = get();
    const updated = routines.filter(r => r.id !== id);
    set({ routines: updated });
    await AsyncStorage.setItem('@orbit_routines', JSON.stringify(updated));
  },

  startWorkout: (routineId) => {
    set({
      activeWorkout: {
        routineId,
        startTime: Date.now(),
        activeExerciseIndex: 0,
        currentSet: 1,
        isResting: false,
      }
    });
  },

  completeSet: () => {
    const { activeWorkout, routines } = get();
    if (!activeWorkout) return;

    const routine = routines.find(r => r.id === activeWorkout.routineId);
    if (!routine) return;

    const currentExercise = routine.exercises[activeWorkout.activeExerciseIndex];
    if (!currentExercise) return;

    // Check if it's the last set of the current exercise
    if (activeWorkout.currentSet >= currentExercise.sets) {
      // Move to next exercise
      if (activeWorkout.activeExerciseIndex + 1 < routine.exercises.length) {
        set({
          activeWorkout: {
            ...activeWorkout,
            activeExerciseIndex: activeWorkout.activeExerciseIndex + 1,
            currentSet: 1,
            isResting: true,
            restEndTime: Date.now() + (currentExercise.restSeconds * 1000)
          }
        });
      } else {
        // Workout complete! (We can just end it or show a summary)
        set({ activeWorkout: null });
        return;
      }
    } else {
      // Next set of same exercise
      set({
        activeWorkout: {
          ...activeWorkout,
          currentSet: activeWorkout.currentSet + 1,
          isResting: true,
          restEndTime: Date.now() + (currentExercise.restSeconds * 1000)
        }
      });
    }

    // Schedule notification for rest end
    if (currentExercise.restSeconds > 0) {
      NotificationService.scheduleRestEndNotification(currentExercise.restSeconds).then(id => {
        const currentActive = get().activeWorkout;
        if (currentActive && id) {
          set({
            activeWorkout: { ...currentActive, restNotificationId: id }
          });
        }
      });
    }
  },

  skipRest: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    // Cancel the notification if it exists
    if (activeWorkout.restNotificationId) {
      NotificationService.cancelNotification(activeWorkout.restNotificationId);
    }

    set({
      activeWorkout: { ...activeWorkout, isResting: false, restNotificationId: undefined }
    });
  },

  endWorkout: () => {
    const { activeWorkout } = get();
    if (activeWorkout?.restNotificationId) {
      NotificationService.cancelNotification(activeWorkout.restNotificationId);
    }
    set({ activeWorkout: null });
  }
}));
