import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';

// Configurar cómo se comportan las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface FocusTimerProps {
  initialMinutes?: number;
  onFinish: () => void;
  onCancel: () => void;
}

export function FocusTimer({ initialMinutes = 25, onFinish, onCancel }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Pedir permisos de notificación al montar el componente
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Lanzar notificación local
      Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Foco Terminado! 🎯",
          body: "Has completado tu sesión de trabajo. ¡Buen trabajo!",
          sound: true,
        },
        trigger: null, // trigger null = lanzar de inmediato
      });
      setIsActive(false);
      onFinish();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFinish]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" style={styles.overline}>
        SESIÓN EN CURSO
      </ThemedText>
      
      <View style={styles.circle}>
        <ThemedText style={styles.timerText}>{formattedTime}</ThemedText>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary]} 
          onPress={() => setIsRunning(!isRunning)}
        >
          <ThemedText style={styles.buttonText}>{isRunning ? 'Pausar' : 'Reanudar'}</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonDanger]} 
          onPress={onCancel}
        >
          <ThemedText style={styles.buttonText}>Detener</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    borderRadius: 32,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    gap: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#2A2A2A',
  },
  buttonDanger: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFF',
  },
});
