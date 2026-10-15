import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useFitnessStore } from '@/store/fitness';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function FitnessDashboard() {
  const router = useRouter();
  const { routines, loadRoutines, startWorkout, deleteRoutine } = useFitnessStore();

  useEffect(() => {
    loadRoutines();
  }, []);

  const handleStartWorkout = (routineId: string) => {
    startWorkout(routineId);
    router.push('/fitness/workout');
  };

  const handleCreateRoutine = () => {
    router.push('/fitness/routine');
  };

  const handleDeleteRoutine = (id: string) => {
    Alert.alert(
      "Eliminar Rutina",
      "¿Estás seguro de que deseas eliminar esta rutina?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => deleteRoutine(id), style: "destructive" }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Mis Rutinas</ThemedText>
          <TouchableOpacity onPress={handleCreateRoutine} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={64} color="#555" />
            <ThemedText style={styles.emptyText}>No tienes rutinas todavía.</ThemedText>
            <TouchableOpacity onPress={handleCreateRoutine} style={styles.createBtn}>
              <ThemedText style={styles.createBtnText}>Crear mi primera rutina</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          routines.map(routine => (
            <View key={routine.id} style={styles.routineCard}>
              <View style={styles.routineHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.colorIndicator, { backgroundColor: routine.color }]} />
                  <ThemedText style={styles.routineName}>{routine.name}</ThemedText>
                </View>
                
                <View style={styles.routineActions}>
                  <TouchableOpacity onPress={() => router.push(`/fitness/routine?id=${routine.id}`)} style={styles.iconBtn}>
                    <Ionicons name="pencil" size={20} color="#888" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteRoutine(routine.id)} style={styles.iconBtn}>
                    <Ionicons name="trash" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText style={styles.exerciseCount}>
                {routine.exercises.length} ejercicios
              </ThemedText>

              <TouchableOpacity 
                style={[styles.startBtn, { backgroundColor: routine.color }]}
                onPress={() => handleStartWorkout(routine.id)}
              >
                <ThemedText style={styles.startBtnText}>Iniciar Entrenamiento</ThemedText>
                <Ionicons name="play" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))
        )}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.four },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  addBtn: { backgroundColor: '#333', padding: 8, borderRadius: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 16 },
  emptyText: { color: '#888', fontSize: 16 },
  createBtn: { backgroundColor: '#FFA500', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  routineCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  colorIndicator: { width: 12, height: 12, borderRadius: 6 },
  routineName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  routineActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  exerciseCount: { color: '#888', fontSize: 14, marginBottom: 16 },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
