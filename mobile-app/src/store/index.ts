import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models/Task';
import { FixedExpense, Budget, Expense } from '../models/Expense';
import { TimeSession } from '../models/TimeSession';
import { NoteList } from '../models/NoteList';
import { FocusSessionState, FocusSessionConfig } from '../models/FocusSession';
import { Alert } from 'react-native';
import { NotificationService } from '../utils/NotificationService';
import { calculateNextDueDate } from '../utils/scheduler';
import { updateAllWidgets } from '../widget/update-widgets';

export interface FocusTemplate {
  id: string;
  label: string;
  total: number;
  breakInt: number;
  breakDur: number;
  icon: string;
  color: string;
}

export const DEFAULT_FOCUS_TEMPLATES: FocusTemplate[] = [
  { id: "Estudio", label: "Estudio", total: 45, breakInt: 20, breakDur: 5, icon: "book-outline", color: "#6A5ACD" },
  { id: "Ejercicio", label: "Ejercicio", total: 30, breakInt: 15, breakDur: 5, icon: "barbell-outline", color: "#FFA500" },
  { id: "Lectura", label: "Lectura", total: 60, breakInt: 30, breakDur: 10, icon: "glasses-outline", color: "#00CED1" },
  { id: "Deep Work", label: "Deep Work", total: 90, breakInt: 45, breakDur: 10, icon: "git-network-outline", color: "#FF1493" },
];

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  accentColor: string;
  themeMode: ThemeMode;
  alarmSound: string;
  setAccentColor: (color: string) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAlarmSound: (sound: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Focus Mode
  focusTemplates: FocusTemplate[];
  updateFocusTemplate: (id: string, updates: Partial<FocusTemplate>) => Promise<void>;
  focusState: FocusSessionState;
  startFocusSession: (config: FocusSessionConfig) => Promise<void>;
  endFocusSession: () => Promise<void>;
  promptFocusBreak: () => Promise<void>;
  acceptFocusBreak: () => Promise<void>;
  
  currentTask: Task | null;
  tasks: Task[];
  expenses: Expense[];
  fixedExpenses: FixedExpense[];
  budget: Budget | null;
  timeSessions: TimeSession[];
  noteLists: NoteList[];
  balance: number;
  syncState: 'idle' | 'syncing' | 'error';
  isSettingsVisible: boolean;
  loadTasks: () => Promise<void>;
  addTask: (title: string, type?: 'EVENT' | 'TODO' | 'HABIT') => Promise<void>;
  createTodo: (title: string, date: number, importance: 'LOW'|'MEDIUM'|'HIGH') => Promise<void>;
  createEvent: (title: string, date: number, recurrence: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeCurrentTask: () => Promise<void>;
  calculateBalance: () => void;
  loadExpenses: () => Promise<void>;
  addExpense: (amount: number, description: string) => Promise<void>;
  
  loadFixedExpenses: () => Promise<void>;
  addFixedExpense: (name: string, amount: number, icon?: string, color?: string) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;

  setBudget: (amount: number) => Promise<void>;
  addTimeSession: (minutes: number, taskId?: string) => Promise<void>;
  
  setSettingsVisible: (visible: boolean) => void;
  
  // NoteLists
  loadNoteLists: () => Promise<void>;
  addNoteList: (title: string, color: string) => Promise<void>;
  updateNoteList: (id: string, updates: Partial<NoteList>) => Promise<void>;
  deleteNoteList: (id: string) => Promise<void>;

  syncWithMongo: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  accentColor: '#9C27B0', // Por defecto morado
  themeMode: 'dark',
  alarmSound: 'default',
  currentTask: null,
  tasks: [],
  expenses: [],
  fixedExpenses: [],
  focusTemplates: DEFAULT_FOCUS_TEMPLATES,
  budget: null,
  timeSessions: [],
  noteLists: [],
  balance: 0,
  syncState: 'idle',
  isSettingsVisible: false,

  focusState: {
    isActive: false,
    config: null,
    started_at: null,
    paused_at: null,
    accumulated_minutes: 0,
    is_on_break: false,
  },

  startFocusSession: async (config: FocusSessionConfig) => {
    try {
      const { focusState } = get();
      // Cancelar solo las alarmas previas del modo enfoque si existían
      if (focusState.alarmNotificationIds && focusState.alarmNotificationIds.length > 0) {
        for (const id of focusState.alarmNotificationIds) {
          await NotificationService.cancelNotification(id);
        }
      }

      const now = Date.now();
      const newState: FocusSessionState = {
        isActive: true,
        config,
        started_at: now,
        paused_at: null,
        accumulated_minutes: 0,
        is_on_break: false,
        alarmNotificationIds: [],
      };
      set({ focusState: newState });
      await AsyncStorage.setItem('focusState', JSON.stringify(newState));
      updateAllWidgets().catch(console.log);
      
      const ongoingId = await NotificationService.showOngoingFocusNotification(
        "Modo Enfoque Activo 🚀",
        `Plantilla: ${config.total_duration_minutes} min. ¡A darle con todo!`
      );
      
      newState.ongoingNotificationId = ongoingId;

      const totalSeconds = config.total_duration_minutes * 60;
      const breakIntervalSecs = config.break_interval_minutes * 60;
      const breakDurationSecs = config.break_duration_minutes * 60;
      const scheduledIds: string[] = [];
      
      // Programar todos los intervalos
      let currentSeconds = breakIntervalSecs;
      
      while (currentSeconds < totalSeconds) {
        // Inicio de descanso
        const bStartId = await NotificationService.scheduleAlarmNotification(
          "¡Tiempo de Descanso! ☕", 
          "Haz completado un bloque de enfoque. Tómate un respiro.", 
          currentSeconds
        );
        if (bStartId) scheduledIds.push(bStartId);
        
        currentSeconds += breakDurationSecs;
        
        // Fin de descanso (solo si no coincide con el final de la sesión)
        if (currentSeconds < totalSeconds) {
          const bEndId = await NotificationService.scheduleAlarmNotification(
            "¡Fin del Descanso! 🚀", 
            "Es hora de volver al trabajo. ¡Tú puedes!", 
            currentSeconds
          );
          if (bEndId) scheduledIds.push(bEndId);
        }
        
        currentSeconds += breakIntervalSecs;
      }
      
      // Final de la sesión
      const endId = await NotificationService.scheduleAlarmNotification(
        "¡Modo Enfoque Terminado! 🎉", 
        "¡Felicidades! Completaste toda tu sesión.", 
        totalSeconds
      );
      if (endId) scheduledIds.push(endId);

      newState.alarmNotificationIds = scheduledIds;
      set({ focusState: newState });
      await AsyncStorage.setItem('focusState', JSON.stringify(newState));
      
    } catch (e) {
      console.log('Error starting focus session:', e);
    }
  },

  promptFocusBreak: async () => {
    // Si la app está en foreground y toca preguntar por el break.
    // Realmente la notificación nativa lo hará si está en background.
  },

  acceptFocusBreak: async () => {
    const { focusState } = get();
    if (!focusState.config || !focusState.isActive) return;

    // Cancelar alarmas previas de enfoque
    if (focusState.alarmNotificationIds && focusState.alarmNotificationIds.length > 0) {
      for (const id of focusState.alarmNotificationIds) {
        await NotificationService.cancelNotification(id);
      }
    }

    const endBreakSeconds = focusState.config.break_duration_minutes * 60;
    const endBreakId = await NotificationService.scheduleAlarmNotification(
      "¡Fin del Descanso! 🚀", 
      "Es hora de volver al trabajo. ¡Tú puedes!", 
      endBreakSeconds
    );

    set({
      focusState: {
        ...focusState,
        is_on_break: true,
        alarmNotificationIds: endBreakId ? [endBreakId] : [],
      }
    });

    console.log(`[Modo Enfoque] Alarma programada para fin de descanso en ${focusState.config.break_duration_minutes} min.`);
  },

  endFocusSession: async () => {
    const { focusState, addTimeSession } = get();
    if (!focusState.isActive || !focusState.config || !focusState.started_at) return;

    const now = Date.now();
    const elapsedMinutes = Math.floor((now - focusState.started_at) / (1000 * 60));
    
    // Guardar estadísticas de enfoque
    await addTimeSession(elapsedMinutes, focusState.config.id); // Guardamos la sesión

    if (focusState.ongoingNotificationId) {
      NotificationService.dismissNotification(focusState.ongoingNotificationId);
    }
    // Cancelar solo las alarmas del modo enfoque, protegiendo las del calendario
    if (focusState.alarmNotificationIds && focusState.alarmNotificationIds.length > 0) {
      for (const id of focusState.alarmNotificationIds) {
        await NotificationService.cancelNotification(id);
      }
    }
    console.log('[Modo Enfoque] Cancelando notificaciones del modo enfoque...');

    set({
      focusState: {
        isActive: false,
        config: null,
        started_at: null,
        paused_at: null,
        accumulated_minutes: 0,
        is_on_break: false,
        alarmNotificationIds: [],
      }
    });
    await AsyncStorage.removeItem('focusState');
    updateAllWidgets().catch(console.log);
  },

  loadSettings: async () => {
    try {
      const storedColor = await AsyncStorage.getItem('accentColor');
      const storedTheme = await AsyncStorage.getItem('themeMode');
      const storedSound = await AsyncStorage.getItem('alarmSound');
      const storedTemplates = await AsyncStorage.getItem('focusTemplates');
      const storedFocusState = await AsyncStorage.getItem('focusState');
      
      if (storedColor) set({ accentColor: storedColor });
      if (storedTheme) set({ themeMode: storedTheme as ThemeMode });
      if (storedSound) set({ alarmSound: storedSound });
      if (storedTemplates) {
        set({ focusTemplates: JSON.parse(storedTemplates) });
      }
      if (storedFocusState) {
        const parsedState = JSON.parse(storedFocusState);
        // Verificar si la sesión ya expiró mientras la app estaba cerrada
        if (parsedState.isActive && parsedState.started_at && parsedState.config) {
          const now = Date.now();
          const elapsed = (now - parsedState.started_at) / 60000;
          if (elapsed >= parsedState.config.total_duration_minutes) {
             // Ya terminó, limpiar
             await AsyncStorage.removeItem('focusState');
          } else {
            set({ focusState: parsedState });
          }
        }
      }
    } catch (e) {
      console.log('Error loading settings:', e);
    }
  },

  setAccentColor: async (color: string) => {
    set({ accentColor: color });
    await AsyncStorage.setItem('accentColor', color);
  },

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    await AsyncStorage.setItem('themeMode', mode);
  },

  setAlarmSound: async (sound: string) => {
    set({ alarmSound: sound });
    await AsyncStorage.setItem('alarmSound', sound);
  },

  updateFocusTemplate: async (id: string, updates: Partial<FocusTemplate>) => {
    const current = get().focusTemplates;
    const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
    set({ focusTemplates: updated });
    await AsyncStorage.setItem('focusTemplates', JSON.stringify(updated));
  },

  // Cargar desde AsyncStorage (Local)
  loadTasks: async () => {
    try {
      const storedTasksStr = await AsyncStorage.getItem('tasks');
      const storedSessionsStr = await AsyncStorage.getItem('timeSessions');
      
      const allTasks: Task[] = storedTasksStr ? JSON.parse(storedTasksStr) : [];
      const allSessions: TimeSession[] = storedSessionsStr ? JSON.parse(storedSessionsStr) : [];
      
      const pendingTasks = allTasks
        .filter(t => t.status === 'PENDING')
        .sort((a, b) => b.created_at - a.created_at);

      set({ 
        tasks: allTasks,
        timeSessions: allSessions,
        currentTask: pendingTasks.length > 0 ? pendingTasks[0] : null
      });
      updateAllWidgets().catch(console.log);
    } catch (e) {
      console.log('Error loading tasks:', e);
    }
  },

  addTask: async (title: string, type = 'TODO') => {
    try {
      const { parseNaturalRecurrence, parseExactDate } = require('../utils/scheduler');
      // Notificaciones deshabilitadas temporalmente para Expo Go
      // const Notifications = require('expo-notifications');
      
      const recurrence = parseNaturalRecurrence(title);
      const exactDate = parseExactDate(title);
      const dueDate = exactDate || Date.now();
      
      const newTask: Task = {
        id: Math.random().toString(36).substring(7), // Generador UUID simple
        title,
        type,
        status: 'PENDING',
        due_date: dueDate, // <-- Cambio: Todo cae en Hoy por defecto
        recurrence_rule: recurrence ? JSON.stringify(recurrence) : undefined,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      set((state) => ({ tasks: [newTask, ...state.tasks] }));

      // Si hay fecha exacta, programar push notification (Deshabilitado en Expo Go)
      if (dueDate > Date.now()) {
        console.log(`[Tarea] Notificación simulada programada para ${new Date(dueDate).toLocaleString()}`);
      }

      const currentTasks = get().tasks;
      const updatedTasks = [...currentTasks, newTask];
      
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      await get().loadTasks();
    } catch (e) {
      console.log('Error agregando tarea NLP', e);
    }
  },

  createTodo: async (title: string, date: number, importance: 'LOW'|'MEDIUM'|'HIGH') => {
    try {
      const newTask: Task = {
        id: Math.random().toString(36).substring(7),
        title,
        type: 'TODO',
        status: 'PENDING',
        importance,
        due_date: date,
        has_time: false,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      if (date > Date.now()) {
        const reminderDate = new Date(date);
        reminderDate.setHours(20, 0, 0, 0);
        if (reminderDate.getTime() > Date.now()) {
          const id1 = await NotificationService.scheduleExactReminder(
            "⏰ Recordatorio de Tarea",
            `No olvides completar: ${title}`,
            reminderDate.getTime()
          );
          if (id1) newTask.notification_ids = [id1];
        }
      }

      const current = get().tasks;
      await AsyncStorage.setItem('tasks', JSON.stringify([newTask, ...current]));
      
      await get().loadTasks();
    } catch (e) {
      console.log('Error creating todo', e);
    }
  },

  createEvent: async (title: string, date: number, recurrence: string) => {
    try {
      const newEvent: Task = {
        id: Math.random().toString(36).substring(7),
        title,
        type: 'EVENT',
        status: 'PENDING',
        due_date: date,
        has_time: true,
        recurrence_rule: recurrence !== 'NONE' ? recurrence : undefined,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      // 1. Actualización optimista instantánea en memoria (0ms lag en UI)
      const current = get().tasks;
      const updatedList = [newEvent, ...current];
      const pendingTasks = updatedList
        .filter(t => t.status === 'PENDING')
        .sort((a, b) => b.created_at - a.created_at);

      set({
        tasks: updatedList,
        currentTask: pendingTasks.length > 0 ? pendingTasks[0] : null
      });

      // 2. Persistir en disco y actualizar widgets en segundo plano
      AsyncStorage.setItem('tasks', JSON.stringify(updatedList)).catch(console.error);
      updateAllWidgets().catch(console.log);

      // 3. Programación asíncrona de notificaciones sin bloquear la pantalla
      const scheduleNotifications = async () => {
        const notifIds: string[] = [];
        if (recurrence && recurrence !== 'NONE') {
          const ids = await NotificationService.scheduleRecurringReminder(
            "📅 Evento: " + title,
            "Tu evento está programado para ahora.",
            new Date(date),
            recurrence
          );
          notifIds.push(...ids);
        } else if (date > Date.now()) {
          const id1 = await NotificationService.scheduleExactReminder(
            "📅 Evento ahora",
            title,
            date
          );
          if (id1) notifIds.push(id1);

          const thirtyMinsBefore = date - (30 * 60 * 1000);
          if (thirtyMinsBefore > Date.now()) {
            const id2 = await NotificationService.scheduleExactReminder(
              "⏳ En 30 minutos",
              `Tu evento "${title}" está por comenzar.`,
              thirtyMinsBefore
            );
            if (id2) notifIds.push(id2);
          }
        }

        if (notifIds.length > 0) {
          newEvent.notification_ids = notifIds;
          const latestTasks = get().tasks.map(t => t.id === newEvent.id ? { ...t, notification_ids: notifIds } : t);
          set({ tasks: latestTasks });
          await AsyncStorage.setItem('tasks', JSON.stringify(latestTasks));
        }
      };

      scheduleNotifications().catch(console.error);
    } catch (e) {
      console.log('Error creating event', e);
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map(t => t.id === id ? { ...t, ...updates, updated_at: Date.now() } : t);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      await get().loadTasks();
    } catch (e) {
      console.log('Error updating task:', e);
    }
  },

  deleteTask: async (id: string) => {
    try {
      const currentTasks = get().tasks;
      const taskToDelete = currentTasks.find(t => t.id === id);
      if (taskToDelete?.notification_ids) {
        for (const notifId of taskToDelete.notification_ids) {
          await NotificationService.cancelNotification(notifId);
        }
      }

      const updatedTasks = currentTasks.filter(t => t.id !== id);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      await get().loadTasks();
    } catch (e) {
      console.log('Error deleting task:', e);
    }
  },

  completeCurrentTask: async () => {
    const { currentTask, tasks } = get();
    if (!currentTask) return;

    try {
      const now = Date.now();
      
      // 1. Marcar la actual como completada
      const updatedTasks = tasks.map(t => {
        if (t.id === currentTask.id) {
          return {
            ...t,
            status: 'DONE' as const,
            last_completed_at: now,
            updated_at: now,
          };
        }
        return t;
      });

      // 2. Si tiene recurrencia, generar el próximo clon para el futuro
      if (currentTask.recurrence_rule) {
        const nextDueDate = calculateNextDueDate(currentTask.recurrence_rule, now);
        
        if (nextDueDate) {
          const clonedTask: Task = {
            id: Math.random().toString(36).substring(7),
            title: currentTask.title,
            type: currentTask.type,
            status: 'PENDING',
            due_date: nextDueDate,
            recurrence_rule: currentTask.recurrence_rule,
            created_at: now,
            updated_at: now,
          };
          updatedTasks.push(clonedTask);
        }
      }

      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      await get().loadTasks();
    } catch (e) {
      console.log('Error completing task:', e);
    }
  },

  // ---- FINANZAS ----
  calculateBalance: () => {
    const { expenses, budget, fixedExpenses } = get();
    let variableBalance = 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    expenses.forEach(exp => {
      if (exp.created_at >= startOfMonth) {
        variableBalance += exp.amount;
      }
    });
    
    let fijos = 0;
    fixedExpenses.forEach(f => {
      fijos += f.amount;
    });

    const limit = budget ? budget.monthly_limit : 0;
    // Si amount de exp es GASTO > 0, si es INGRESO < 0
    set({ balance: limit - fijos - variableBalance });
  },

  loadExpenses: async () => {
    try {
      const storedExpensesStr = await AsyncStorage.getItem('expenses');
      const storedBudgetStr = await AsyncStorage.getItem('budget');
      
      const allExpenses: Expense[] = storedExpensesStr ? JSON.parse(storedExpensesStr) : [];
      const budget: Budget | null = storedBudgetStr ? JSON.parse(storedBudgetStr) : null;
      
      set({ 
        expenses: allExpenses,
        budget: budget,
      });
      get().calculateBalance();
    } catch (e) {
      console.log('Error loading expenses:', e);
    }
  },

  loadFixedExpenses: async () => {
    try {
      const stored = await AsyncStorage.getItem('fixedExpenses');
      if (stored) {
        set({ fixedExpenses: JSON.parse(stored) });
        get().calculateBalance();
      }
    } catch (e) {
      console.log('Error loading fixed expenses', e);
    }
  },

  addFixedExpense: async (name: string, amount: number, icon?: string, color?: string) => {
    try {
      const newFixed: FixedExpense = {
        id: Math.random().toString(36).substring(7),
        name,
        amount,
        icon,
        color
      };
      const current = get().fixedExpenses;
      const updated = [...current, newFixed];
      await AsyncStorage.setItem('fixedExpenses', JSON.stringify(updated));
      await get().loadFixedExpenses();
    } catch (e) {
      console.log('Error adding fixed expense', e);
    }
  },

  deleteFixedExpense: async (id: string) => {
    try {
      const current = get().fixedExpenses;
      const updated = current.filter(f => f.id !== id);
      await AsyncStorage.setItem('fixedExpenses', JSON.stringify(updated));
      await get().loadFixedExpenses();
    } catch (e) {
      console.log('Error deleting fixed expense', e);
    }
  },

  addExpense: async (amount: number, description: string) => {
    try {
      const descLower = description.toLowerCase();
      let category = 'Otros';
      if (descLower.match(/uber|gasolina|pasaje|taxi|bus/)) category = '🚕 Transporte';
      else if (descLower.match(/netflix|cine|juego|spotify|suscripcion/)) category = '🎬 Entretenimiento';
      else if (descLower.match(/comida|restaurante|super|mercado|pizza/)) category = '🍔 Comida';
      else if (descLower.match(/luz|agua|internet|telefono|celular/)) category = '💡 Servicios';

      const finalDescription = `[${category}] ${description}`;

      const newExpense: Expense = {
        id: Math.random().toString(36).substring(7),
        amount,
        description: finalDescription,
        created_at: Date.now(),
      };

      const currentExpenses = get().expenses;
      set({ expenses: [newExpense, ...get().expenses] });
      await AsyncStorage.setItem('expenses', JSON.stringify(get().expenses));
      get().calculateBalance();
    } catch (e) {
      console.log('Error adding expense', e);
    }
  },

  setBudget: async (amount: number) => {
    try {
      const budget: Budget = { monthly_limit: amount };
      set({ budget });
      await AsyncStorage.setItem('budget', JSON.stringify(budget));
      get().calculateBalance();
    } catch (e) {
      console.log('Error setting budget', e);
    }
  },

  addTimeSession: async (minutes: number, taskId?: string) => {
    try {
      const newSession: TimeSession = {
        id: Math.random().toString(36).substring(7),
        duration_minutes: minutes,
        task_title: taskId, // the variable is taskId but the field is task_title
        created_at: Date.now(),
      };

      const currentSessions = get().timeSessions;
      const updatedSessions = [...currentSessions, newSession];
      
      await AsyncStorage.setItem('timeSessions', JSON.stringify(updatedSessions));
      set({ timeSessions: updatedSessions });
    } catch (e) {
      console.log('Error adding time session', e);
    }
  },

  // ---- NOTE LISTS (BLOC DE NOTAS) ----
  loadNoteLists: async () => {
    try {
      const storedStr = await AsyncStorage.getItem('noteLists');
      if (storedStr) {
        set({ noteLists: JSON.parse(storedStr) });
      }
    } catch (e) {
      console.log('Error loading note lists:', e);
    }
  },

  addNoteList: async (title: string, color: string) => {
    try {
      const newList: NoteList = {
        id: Math.random().toString(36).substring(7),
        title,
        content: '',
        color,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      const current = get().noteLists;
      const updated = [...current, newList];
      await AsyncStorage.setItem('noteLists', JSON.stringify(updated));
      await get().loadNoteLists();
    } catch (e) {
      console.log('Error adding note list:', e);
    }
  },

  updateNoteList: async (id: string, updates: Partial<NoteList>) => {
    try {
      const current = get().noteLists;
      const updated = current.map(list => 
        list.id === id ? { ...list, ...updates, updated_at: Date.now() } : list
      );
      await AsyncStorage.setItem('noteLists', JSON.stringify(updated));
      await get().loadNoteLists();
    } catch (e) {
      console.log('Error updating note list:', e);
    }
  },

  deleteNoteList: async (id: string) => {
    try {
      const current = get().noteLists;
      const updated = current.filter(list => list.id !== id);
      await AsyncStorage.setItem('noteLists', JSON.stringify(updated));
      await get().loadNoteLists();
    } catch (e) {
      console.log('Error deleting note list:', e);
    }
  },

  // Función para sincronizar con MongoDB a través del Micro-Backend
  syncWithMongo: async () => {
    const { tasks } = get();
    if (tasks.length === 0) return;

    set({ syncState: 'syncing' });

    try {
      console.log('Sincronizando', tasks.length, 'tareas con MongoDB...');
      // Usamos una URL genérica para dev (Si estás en dispositivo físico, cambia localhost por tu IP local)
      const BACKEND_URL = 'http://127.0.0.1:3000/api/sync';
      
      // Importación dinámica de axios o require para evitar errores si no se compiló
      const axios = require('axios').default;
      
      const response = await axios.post(BACKEND_URL, { tasks });
      console.log('Sync completado:', response.data);
      set({ syncState: 'idle' });
    } catch (e) {
      console.log('Error synchronizing with MongoDB:', e);
      set({ syncState: 'error' });
    }
  },

  setSettingsVisible: (visible: boolean) => {
    set({ isSettingsVisible: visible });
  }
}));
