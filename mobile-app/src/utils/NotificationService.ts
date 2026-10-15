import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNELS = {
  ALARM: 'alarm-channel-v3',
  DEFAULT: 'default-channel',
};

// Configuración global sobre cómo mostrar las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async init() {
    if (Platform.OS === 'android') {
      // Canal para Modo Enfoque (Alarma Fuerte y Larga)
      await Notifications.setNotificationChannelAsync(CHANNELS.ALARM, {
        name: 'Alarmas de Enfoque',
        description: 'Notificaciones para fin de Pomodoro o descansos',
        importance: Notifications.AndroidImportance.MAX,
        bypassDnd: true,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
          flags: {
            enforceAudibility: true,
            requestHardwareAudioVideoSynchronization: false,
          },
        },
        vibrationPattern: [0, 500, 250, 500, 250, 500, 1000, 500, 250, 500, 250, 500],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // Canal para Recordatorios (Tradicionales)
      await Notifications.setNotificationChannelAsync(CHANNELS.DEFAULT, {
        name: 'Recordatorios',
        description: 'Recordatorios de tareas y eventos del calendario',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#208AEF',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Permisos de notificación no concedidos.');
      return false;
    }
    return true;
  },

  async scheduleAlarmNotification(title: string, body: string, triggerSeconds: number) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'alarm' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        channelId: CHANNELS.ALARM,
      },
    });
    return id;
  },

  async scheduleRestEndNotification(triggerSeconds: number) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "¡Descanso terminado! 🏋️‍♂️",
        body: "Es hora de tu siguiente serie. ¡Con todo!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'fitness_rest' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        channelId: CHANNELS.ALARM,
      },
    });
    return id;
  },

  async showOngoingFocusNotification(title: string, body: string) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        autoDismiss: false,
        sticky: true,
        data: { type: 'ongoing_focus' },
      },
      trigger: null, // trigger null = mostrar inmediatamente
    });
    return id;
  },

  async cancelNotification(id: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      console.warn("Could not cancel notification", e);
    }
  },

  async scheduleExactReminder(title: string, body: string, timestamp: number) {
    // Si la fecha ya pasó, no la programamos
    if (timestamp <= Date.now()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(timestamp),
        channelId: CHANNELS.DEFAULT,
      },
    });
    return id;
  },

  async scheduleRecurringReminder(title: string, body: string, date: Date, recurrence: string) {
    const ids: string[] = [];
    const eventHour = date.getHours();
    const eventMinute = date.getMinutes();

    // Cálculo de hora/minuto para el aviso de 30 minutos antes
    const totalMinutes = eventHour * 60 + eventMinute - 30;
    const normalizedMinutes = (totalMinutes + 1440) % 1440;
    const beforeHour = Math.floor(normalizedMinutes / 60);
    const beforeMinute = normalizedMinutes % 60;

    const scheduleDailyTrigger = async (hour: number, minute: number, isPreAlert = false) => {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: isPreAlert ? "⏳ En 30 minutos" : `📅 Evento: ${title}`,
          body: isPreAlert ? `Tu evento "${title}" está por comenzar.` : body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: CHANNELS.DEFAULT,
        },
      });
      if (id) ids.push(id);
    };

    const scheduleWeeklyTrigger = async (weekday: number, hour: number, minute: number, isPreAlert = false) => {
      // Si el pre-aviso cruza la medianoche hacia atrás (ej: evento domingo a las 00:15, aviso sábado 23:45)
      let alertWeekday = weekday;
      if (isPreAlert && totalMinutes < 0) {
        alertWeekday = weekday === 1 ? 7 : weekday - 1;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: isPreAlert ? "⏳ En 30 minutos" : `📅 Evento: ${title}`,
          body: isPreAlert ? `Tu evento "${title}" está por comenzar.` : body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: alertWeekday,
          hour,
          minute,
          channelId: CHANNELS.DEFAULT,
        },
      });
      if (id) ids.push(id);
    };

    if (recurrence === 'DAILY') {
      // Alarma en la hora exacta del evento
      await scheduleDailyTrigger(eventHour, eventMinute, false);
      // Pre-alerta 30 minutos antes
      await scheduleDailyTrigger(beforeHour, beforeMinute, true);
    } else if (recurrence === 'WEEKLY') {
      // En Expo: 1 = Domingo, 2 = Lunes, ..., 7 = Sábado
      const expoWeekday = date.getDay() + 1;
      await scheduleWeeklyTrigger(expoWeekday, eventHour, eventMinute, false);
      await scheduleWeeklyTrigger(expoWeekday, beforeHour, beforeMinute, true);
    } else if (recurrence === 'MONTHLY') {
      const eventDay = date.getDate();
      const idMain = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📅 Evento: ${title}`,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { type: 'reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day: eventDay,
          hour: eventHour,
          minute: eventMinute,
          channelId: CHANNELS.DEFAULT,
        },
      });
      if (idMain) ids.push(idMain);
    } else if (recurrence.startsWith('CUSTOM:')) {
      const daysStr = recurrence.replace('CUSTOM:', '');
      const validDays = daysStr.split(',').map(Number); // 0 (Sun) a 6 (Sat)
      
      for (const d of validDays) {
        const expoWeekday = d + 1; // 1-7
        await scheduleWeeklyTrigger(expoWeekday, eventHour, eventMinute, false);
        await scheduleWeeklyTrigger(expoWeekday, beforeHour, beforeMinute, true);
      }
    }
    
    return ids;
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async dismissNotification(id: string) {
    await Notifications.dismissNotificationAsync(id);
  }
};
